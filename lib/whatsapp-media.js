const { WHATSAPP_TOKEN, PHONE_NUMBER_ID } = require('../config');
const ffmpegPath = require('ffmpeg-static');
const { execFile } = require('child_process');
const { promisify } = require('util');
const execFileAsync = promisify(execFile);
const fs = require('fs');
const os = require('os');
const path = require('path');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

async function convertToMp3(inputBuffer, inputExt = 'm4a') {
  const tmpDir = os.tmpdir();
  const stamp = Date.now();
  const inPath = path.join(tmpDir, `in_${stamp}.${inputExt}`);
  const outPath = path.join(tmpDir, `out_${stamp}.mp3`);
  await fs.promises.writeFile(inPath, inputBuffer);
  try {
    await execFileAsync(ffmpegPath, ['-y', '-i', inPath, '-vn', '-ar', '44100', '-ac', '2', '-b:a', '128k', '-f', 'mp3', outPath]);
    return await fs.promises.readFile(outPath);
  } finally {
    fs.promises.unlink(inPath).catch(() => {});
    fs.promises.unlink(outPath).catch(() => {});
  }
}

function pickReferer(url) {
  try {
    const host = new URL(url).hostname;
    if (host.includes('capcut')) return 'https://www.capcut.com/';
    if (host.includes('douyin')) return 'https://www.douyin.com/';
    if (host.includes('instagram') || host.includes('cdninstagram') || host.includes('rapidcdn')) return 'https://www.instagram.com/';
    if (host.includes('tiktok')) return 'https://www.tiktok.com/';
    if (host.includes('youtube') || host.includes('ytimg') || host.includes('ymcdn')) return 'https://www.youtube.com/';
    if (host.includes('facebook') || host.includes('fbcdn')) return 'https://www.facebook.com/';
    return new URL(url).origin + '/';
  } catch { return null; }
}

async function uploadMedia(buffer, mimeType, filename) {
  const form = new FormData();
  form.append('messaging_product', 'whatsapp');
  form.append('type', mimeType);
  form.append('file', new Blob([buffer], { type: mimeType }), filename);
  const res = await fetch(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/media`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` },
    body: form,
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  if (!data.id) throw new Error('Upload ke WhatsApp gak balikin media ID.');
  return data.id;
}

async function downloadMedia(mediaId) {
  const infoRes = await fetch(`https://graph.facebook.com/v21.0/${mediaId}`, {
    headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` },
  });
  const info = await infoRes.json();
  if (info.error) throw new Error(info.error.message);
  const fileRes = await fetch(info.url, { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } });
  const arrayBuffer = await fileRes.arrayBuffer();
  return { buffer: Buffer.from(arrayBuffer), mimeType: info.mime_type };
}

async function uploadSticker(buffer) {
  const form = new FormData();
  form.append('messaging_product', 'whatsapp');
  form.append('type', 'image/webp');
  form.append('file', new Blob([buffer], { type: 'image/webp' }), 'sticker.webp');
  const res = await fetch(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/media`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` },
    body: form,
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.id;
}

async function uploadImage(buffer, filename = 'image.png') {
  const form = new FormData();
  form.append('messaging_product', 'whatsapp');
  form.append('type', 'image/png');
  form.append('file', new Blob([buffer], { type: 'image/png' }), filename);
  const res = await fetch(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/media`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` },
    body: form,
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.id;
}

// Retry 3x kalau sumber 5xx
async function fetchWithRetry(url, headers, maxRetry = 3) {
  let lastErr = null;
  for (let i = 0; i < maxRetry; i++) {
    try {
      const res = await fetch(url, { headers, redirect: 'follow', signal: AbortSignal.timeout(30000) });
      if (res.status >= 500 && i < maxRetry - 1) {
        console.log(`[RELAY] ${res.status}, retry ${i + 1}/${maxRetry}...`);
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        continue;
      }
      return res;
    } catch (e) {
      lastErr = e;
      if (i < maxRetry - 1) {
        console.log(`[RELAY] error, retry ${i + 1}/${maxRetry}:`, e.message);
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
  }
  throw lastErr || new Error('Fetch gagal setelah retry');
}

async function fetchFromUrl(url, extraHeaders = {}) {
  const headers = {
    'User-Agent': UA,
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    ...extraHeaders,
  };
  if (!headers['Referer']) {
    const referer = pickReferer(url);
    if (referer) headers['Referer'] = referer;
  }

  let res = await fetchWithRetry(url, headers);

  if (res.status === 403 && headers['Referer']) {
    console.log('[RELAY] 403, coba tanpa Referer...');
    delete headers['Referer'];
    res = await fetchWithRetry(url, headers);
  }
  if (!res.ok) throw new Error(`Gagal ambil file dari sumber (${res.status})`);

  const arrayBuffer = await res.arrayBuffer();
  return { buffer: Buffer.from(arrayBuffer), contentType: res.headers.get('content-type') || '' };
}

async function relayUrlToMediaId(url, mimeType, filename, extraHeaders = {}) {
  const { buffer, contentType: sourceType } = await fetchFromUrl(url, extraHeaders);

  let finalMime = mimeType;
  if (sourceType.startsWith('audio/')) finalMime = sourceType.split(';')[0].trim();
  else if (sourceType.startsWith('video/')) finalMime = sourceType.split(';')[0].trim();
  else if (sourceType.startsWith('image/')) finalMime = sourceType.split(';')[0].trim();

  let outBuffer = buffer;
  console.log(`[RELAY] ${filename}: ${buffer.length} bytes, source: ${sourceType}, upload: ${finalMime}`);

  if (buffer.length < 1000) throw new Error('File kekecilan, link rusak/expired.');

  if (finalMime.startsWith('audio/') && finalMime !== 'audio/mpeg') {
    console.log('[CONVERT] Convert audio ke MP3 pake ffmpeg...');
    try {
      outBuffer = await convertToMp3(buffer, 'm4a');
      finalMime = 'audio/mpeg';
      filename = filename.replace(/\.\w+$/, '.mp3');
      console.log(`[CONVERT] Hasil: ${outBuffer.length} bytes, ${finalMime}`);
    } catch (e) {
      console.error('[CONVERT] Gagal convert:', e.message);
    }
  }

  return uploadMedia(outBuffer, finalMime, filename);
}

async function relayVideoUrlToAudioMediaId(url, extraHeaders = {}) {
  const { buffer, contentType } = await fetchFromUrl(url, extraHeaders);
  console.log(`[AUDIO-EXTRACT] video: ${buffer.length} bytes, source: ${contentType}`);
  if (buffer.length < 1000) throw new Error('File kekecilan.');

  let ext = 'mp4';
  if (contentType.includes('webm')) ext = 'webm';
  else if (contentType.includes('quicktime')) ext = 'mov';
  else if (contentType.includes('mpeg')) ext = 'mpeg';

  const mp3Buffer = await convertToMp3(buffer, ext);
  console.log(`[AUDIO-EXTRACT] mp3: ${mp3Buffer.length} bytes`);
  return uploadMedia(mp3Buffer, 'audio/mpeg', 'audio.mp3');
}

module.exports = { uploadImage, downloadMedia, uploadSticker, uploadMedia, relayUrlToMediaId, relayVideoUrlToAudioMediaId };
