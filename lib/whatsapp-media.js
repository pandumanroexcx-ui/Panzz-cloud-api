const { WHATSAPP_TOKEN, PHONE_NUMBER_ID } = require('../config');
const ffmpegPath = require('ffmpeg-static');
const { execFile } = require('child_process');
const { promisify } = require('util');
const execFileAsync = promisify(execFile);
const fs = require('fs');
const os = require('os');
const path = require('path');

const MAX_VIDEO_SIZE = 16 * 1024 * 1024;
const MAX_AUDIO_SIZE = 16 * 1024 * 1024;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function detectMime(buffer) {
  if (buffer.length < 12) return null;
  const hex = buffer.slice(0, 12).toString('hex').toLowerCase();
  if (hex.startsWith('ffd8ff')) return 'image/jpeg';
  if (hex.startsWith('89504e47')) return 'image/png';
  if (hex.startsWith('47494638')) return 'image/gif';
  if (hex.startsWith('52494646') && hex.slice(16, 24) === '57454250') return 'image/webp';
  if (hex.slice(8, 16) === '66747970') return 'video/mp4';
  if (hex.startsWith('494433') || hex.startsWith('fffb')) return 'audio/mpeg';
  if (hex.startsWith('4f676753')) return 'audio/ogg';
  if (hex.startsWith('25504446')) return 'application/pdf';
  return null;
}

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

function getHeaders(url) {
  const base = {
    'Accept': '*/*', 'Accept-Language': 'en-US,en;q=0.9',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  };
  try {
    const host = new URL(url).hostname;
    if (host.includes('rapidcdn') || host.includes('cdninstagram')) return { ...base, 'Referer': 'https://www.instagram.com/', 'Origin': 'https://www.instagram.com' };
    if (host.includes('tiktok') || host.includes('tiktokcdn') || host.includes('ibyteimg') || host.includes('tikwm')) return { ...base, 'Referer': 'https://www.tiktok.com/', 'Origin': 'https://www.tiktok.com' };
    if (host.includes('ymcdn') || host.includes('youtube') || host.includes('googlevideo')) return { ...base, 'Referer': 'https://www.youtube.com/' };
    if (host.includes('capcut')) return { ...base, 'Referer': 'https://www.capcut.com/', 'Origin': 'https://www.capcut.com' };
    if (host.includes('fbcdn') || host.includes('facebook')) return { ...base, 'Referer': 'https://www.facebook.com/' };
  } catch {}
  return base;
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

async function uploadDocument(buffer, filename = 'document.pdf') {
  return uploadMedia(buffer, 'application/pdf', filename);
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
  const detected = detectMime(buffer) || 'image/jpeg';
  const extMap = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
  const ext = extMap[detected] || 'jpg';
  const finalName = filename.replace(/\.\w+$/, `.${ext}`);

  const form = new FormData();
  form.append('messaging_product', 'whatsapp');
  form.append('type', detected);
  form.append('file', new Blob([buffer], { type: detected }), finalName);
  const res = await fetch(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/media`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` },
    body: form,
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.id;
}

async function fetchFromUrl(url, extraHeaders = {}) {
  const headers = { ...getHeaders(url), ...extraHeaders };
  console.log('[RELAY] fetching:', url.slice(0, 80) + '...');
  let res = await fetch(url, { headers, redirect: 'follow', signal: AbortSignal.timeout(60000) });
  console.log('[RELAY] status:', res.status);
  if ((res.status === 403 || res.status >= 500)) {
    console.log('[RELAY] retry...');
    await new Promise(r => setTimeout(r, 1500));
    res = await fetch(url, { headers, redirect: 'follow', signal: AbortSignal.timeout(60000) });
    console.log('[RELAY] retry status:', res.status);
  }
  if (!res.ok) throw new Error(`Sumber balikin ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  return { buffer: Buffer.from(arrayBuffer), contentType: res.headers.get('content-type') || '' };
}

async function relayUrlToMediaId(url, mimeType, filename, extraHeaders = {}) {
  const { buffer, contentType: sourceType } = await fetchFromUrl(url, extraHeaders);
  const detected = detectMime(buffer);
  let finalMime = detected || mimeType;
  if (!detected && sourceType && sourceType !== 'application/octet-stream') {
    if (sourceType.startsWith('audio/') || sourceType.startsWith('video/') || sourceType.startsWith('image/')) {
      finalMime = sourceType.split(';')[0].trim();
    }
  }
  let outBuffer = buffer;
  console.log(`[RELAY] ${filename}: ${buffer.length} bytes (${(buffer.length/1024/1024).toFixed(2)} MB), source: ${sourceType}, detected: ${detected || '-'}, upload: ${finalMime}`);
  if (buffer.length < 1000) throw new Error('File kekecilan, link rusak/expired.');
  if (finalMime.startsWith('video/') && buffer.length > MAX_VIDEO_SIZE) throw new Error(`Video kegedean (${(buffer.length/1024/1024).toFixed(1)} MB). Max 16 MB.`);
  if (finalMime.startsWith('audio/') && buffer.length > MAX_AUDIO_SIZE) throw new Error(`Audio kegedean (${(buffer.length/1024/1024).toFixed(1)} MB). Max 16 MB.`);
  if (finalMime.startsWith('image/') && buffer.length > MAX_IMAGE_SIZE) throw new Error(`Gambar kegedean (${(buffer.length/1024/1024).toFixed(1)} MB). Max 5 MB.`);

  if (finalMime.startsWith('audio/') && finalMime !== 'audio/mpeg') {
    console.log('[CONVERT] Convert audio ke MP3...');
    try {
      outBuffer = await convertToMp3(buffer, 'm4a');
      finalMime = 'audio/mpeg';
      filename = filename.replace(/\.\w+$/, '.mp3');
    } catch (e) { console.error('[CONVERT] Gagal:', e.message); }
  }
  const extMap = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'video/mp4': 'mp4', 'audio/mpeg': 'mp3', 'audio/ogg': 'ogg' };
  if (extMap[finalMime]) filename = filename.replace(/\.\w+$/, `.${extMap[finalMime]}`);
  return uploadMedia(outBuffer, finalMime, filename);
}

async function relayVideoUrlToAudioMediaId(url, extraHeaders = {}) {
  const { buffer, contentType } = await fetchFromUrl(url, extraHeaders);
  console.log(`[AUDIO-EXTRACT] video: ${buffer.length} bytes`);
  if (buffer.length < 1000) throw new Error('File kekecilan.');
  let ext = 'mp4';
  if (contentType.includes('webm')) ext = 'webm';
  else if (contentType.includes('quicktime')) ext = 'mov';
  const mp3Buffer = await convertToMp3(buffer, ext);
  console.log(`[AUDIO-EXTRACT] mp3: ${mp3Buffer.length} bytes`);
  return uploadMedia(mp3Buffer, 'audio/mpeg', 'audio.mp3');
}

module.exports = {
  uploadImage, downloadMedia, uploadSticker, uploadMedia, uploadDocument,
  relayUrlToMediaId, relayVideoUrlToAudioMediaId, detectMime,
};
