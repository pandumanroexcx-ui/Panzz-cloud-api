const { WHATSAPP_TOKEN, PHONE_NUMBER_ID } = require('../config');

async function sendMessage(to, body) {
  const url = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body },
    }),
  });
  const data = await res.json();
  if (data.error) console.error('Gagal kirim:', data.error);
  return data;
}

module.exports = { sendMessage };
