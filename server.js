const express = require('express');
const { VERIFY_TOKEN } = require('./config');
const { sendMessage } = require('./lib/send-message');

const app = express();
app.use(express.json());

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

app.post('/webhook', async (req, res) => {
  res.sendStatus(200);

  const entry = req.body.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;
  const message = value?.messages?.[0];

  if (!message) return;

  const from = message.from;
  const text = message.text?.body || '';
  const body = text.trim();
  if (!body) return;

  console.log(`Pesan masuk dari ${from}: ${text}`);

  const commandName = body.toLowerCase().split(' ')[0];
  const args = body.split(' ').slice(1);

  const commands = require('./commands');
  const cmd = commands.get(commandName);

  if (!cmd) {
    console.log(`Command "${commandName}" ga ketemu, diabaikan`);
    return;
  }

  try {
    await cmd.run({ sendMessage, from, args, message, commands });
  } catch (err) {
    console.error(`Error di command "${commandName}":`, err);
    await sendMessage(from, 'Error pas jalanin command itu.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server jalan di port ${PORT}`));
