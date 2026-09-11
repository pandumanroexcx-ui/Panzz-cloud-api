const { WHATSAPP_TOKEN, PHONE_NUMBER_ID } = require('../config');

async function sendRaw(payload) {
  const url = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (data.error) console.error('Gagal kirim:', data.error);
  return data;
}

async function sendMessage(to, body) {
  return sendRaw({ messaging_product: 'whatsapp', to, type: 'text', text: { body } });
}

async function sendImage(to, mediaId, caption = '') {
  return sendRaw({ messaging_product: 'whatsapp', to, type: 'image', image: { id: mediaId, caption } });
}

async function sendList(to, { header, body, footer, buttonText, sections }) {
  return sendRaw({
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'list',
      header: header ? { type: 'text', text: header } : undefined,
      body: { text: body },
      footer: footer ? { text: footer } : undefined,
      action: { button: buttonText, sections },
    },
  });
}

module.exports = { sendMessage, sendImage, sendList };
