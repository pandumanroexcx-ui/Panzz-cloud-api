const { WHATSAPP_TOKEN, PHONE_NUMBER_ID } = require('../config');

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
  // Langkah 1: dapetin URL sementara dari media ID
  const infoRes = await fetch(`https://graph.facebook.com/v21.0/${mediaId}`, {
    headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` },
  });
  const info = await infoRes.json();
  if (info.error) throw new Error(info.error.message);

  // Langkah 2: download file binernya dari URL itu (tetep butuh auth header)
  const fileRes = await fetch(info.url, {
    headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` },
  });
  const arrayBuffer = await fileRes.arrayBuffer();

  return {
    buffer: Buffer.from(arrayBuffer),
    mimeType: info.mime_type,
  };
}

module.exports = { uploadImage, downloadMedia };

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

module.exports.uploadSticker = uploadSticker;

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
  return data.id;
}

async function relayUrlToMediaId(url, mimeType, filename) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  if (!res.ok) throw new Error(`Gagal ambil file dari sumber (${res.status})`);
  const arrayBuffer = await res.arrayBuffer();
  return uploadMedia(Buffer.from(arrayBuffer), mimeType, filename);
}

module.exports.uploadMedia = uploadMedia;
module.exports.relayUrlToMediaId = relayUrlToMediaId;
