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
  return data.id; // media_id
}

module.exports = { uploadImage };
