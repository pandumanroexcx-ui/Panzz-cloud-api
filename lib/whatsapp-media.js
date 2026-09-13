const { WHATSAPP_TOKEN, PHONE_NUMBER_ID } = require('../config');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

function pickReferer(url) {
  try {
    const host = new URL(url).hostname;
    if (host.includes('capcut')) return 'https://www.capcut.com/';
    if (host.includes('douyin')) return 'https://www.douyin.com/';
    if (host.includes('instagram') || host.includes('cdninstagram')) return 'https://www.instagram.com/';
    if (host.includes('tiktok')) return 'https://www.tiktok.com/';
    if (host.includes('youtube') || host.includes('ytimg') || host.includes('ymcdn')) return 'https://www.youtube.com/';
    if (host.includes('facebook') || host.includes('fbcdn')) return 'https://www.facebook.com/';
    return new URL(url).origin + '/';
  } catch {
    return null;
  }
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

async function fetchWithRedirect(url, extraHeaders = {}) {
  const headers = {
    'User-Agent': UA,
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    ...extraHeaders,
  };
  const referer = pickReferer(url);
  if (referer) headers['Referer'] = referer;

  let res = await fetch(url, { headers, redirect: 'follow' });

  if (res.status === 403 && headers['Referer']) {
    console.log('[RELAY] 403 dengan Referer, coba ulang tanpa Referer...');
    delete headers['Referer'];
    res = await fetch(url, { headers, redirect: 'follow' });
  }

  return res;
}

async function relayUrlToMediaId(url, mimeType, filename) {
  const res = await fetchWithRedirect(url);
  if (!res.ok) throw new Error(`Gagal ambil file dari sumber (${res.status})`);

  const sourceType = res.headers.get('content-type') || '';
  let finalMime = mimeType;
  if (sourceType.startsWith('audio/')) finalMime = sourceType.split(';')[0].trim();
  else if (sourceType.startsWith('video/')) finalMime = sourceType.split(';')[0].trim();
  else if (sourceType.startsWith('image/')) finalMime = sourceType.split(';')[0].trim();

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  console.log(`[RELAY] ${filename}: ${buffer.length} bytes, source-type: ${sourceType}, upload-type: ${finalMime}`);

  if (buffer.length < 1000) {
    throw new Error('File yang didownload kekecilan, kemungkinan link-nya rusak/expired.');
  }

  return uploadMedia(buffer, finalMime, filename);
}

module.exports = { uploadImage, downloadMedia, uploadSticker, uploadMedia, relayUrlToMediaId };
