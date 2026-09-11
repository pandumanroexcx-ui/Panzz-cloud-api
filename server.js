const express = require('express');
const { VERIFY_TOKEN } = require('./config');
const { sendMessage, sendImage, sendList } = require('./lib/send-message');

const app = express();
app.use(express.json());

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

async function runCommand(name, ctx) {
  const commands = require('./commands');
  const cmd = commands.get(name);
  if (!cmd) return false;
  try {
    await cmd.run({ ...ctx, commands });
  } catch (err) {
    console.error(`Error di command "${name}":`, err);
    await sendMessage(ctx.from, 'Error pas jalanin command itu.');
  }
  return true;
}

app.post('/webhook', async (req, res) => {
  res.sendStatus(200);

  const entry = req.body.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;
  const message = value?.messages?.[0];
  if (!message) return;

  const from = message.from;
  const ctx = { sendMessage, sendImage, sendList, from, message };

  // Kalau user tap tombol list interaktif
  if (message.type === 'interactive' && message.interactive?.type === 'list_reply') {
    const id = message.interactive.list_reply.id;
    console.log(`List tapped dari ${from}: ${id}`);

    if (id.startsWith('cat:')) {
      const category = id.slice(4);
      const commands = require('./commands');
      const rows = [];
      const seen = new Set();
      for (const cmd of commands.values()) {
        if (cmd.category === category && !seen.has(cmd.name)) {
          seen.add(cmd.name);
          rows.push({ id: cmd.name, title: cmd.name, description: cmd.description || '' });
        }
      }
      await sendList(from, {
        header: category.toUpperCase(),
        body: 'Tap command buat langsung jalanin:',
        buttonText: 'Lihat Command',
        sections: [{ title: category.toUpperCase(), rows }],
      });
    } else {
      await runCommand(id, { ...ctx, args: [] });
    }
    return;
  }

  // Pesan teks biasa
  const text = message.text?.body || '';
  const body = text.trim();
  if (!body) return;

  console.log(`Pesan masuk dari ${from}: ${text}`);

  const commandName = body.toLowerCase().split(' ')[0];
  const args = body.split(' ').slice(1);

  await runCommand(commandName, { ...ctx, args });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server jalan di port ${PORT}`));
