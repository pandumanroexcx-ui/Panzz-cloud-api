const express = require('express');
const { WHATSAPP_TOKEN, PHONE_NUMBER_ID, VERIFY_TOKEN } = require('./config');

const app = express();
app.use(express.json());

// ===== 1. Verifikasi webhook (dipanggil Meta sekali pas setup) =====
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook terverifikasi!');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ===== 2. Terima pesan masuk (dipanggil tiap ada chat baru) =====
app.post('/webhook', async (req, res) => {
  res.sendStatus(200); // wajib respon cepat ke Meta dulu

  const entry = req.body.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;
  const message = value?.messages?.[0];

  if (!message) return; // bukan pesan (bisa status update dll), abaikan

  const from = message.from; // nomor pengirim
  const text = message.text?.body || '';

  console.log(`Pesan masuk dari ${from}: ${text}`);

  // Balas simpel dulu buat testing
  await sendMessage(from, `Kamu bilang: "${text}"`);
});

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

const PORT = 3000;
app.listen(PORT, () => console.log(`Server jalan di port ${PORT}`));
