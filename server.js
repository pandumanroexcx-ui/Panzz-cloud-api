const express = require('express');
const { VERIFY_TOKEN } = require('./config');
const { sendMessage, sendImage, sendList } = require('./lib/send-message');
const { askGemini } = require('./lib/ai-client');
const { isDuplicate } = require('./lib/dedup');

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

  // Cegah proses ulang kalau Meta ngirim webhook duplikat
  if (isDuplicate(message.id)) {
    console.log(`Pesan duplikat diabaikan: ${message.id}`);
    return;
  }

  const from = message.from;
  const ctx = { sendMessage, sendImage, sendList, from, message };

  if (message.type === 'interactive' && message.interactive?.type === 'list_reply') {
    const id = message.interactive.list_reply.id;

    if (id.startsWith('cat:')) {
      const category = id.slice(4);
      const commands = require('./commands');
      const rows = [];
      const seen = new Set();
      for (const cmd of commands.values()) {
        if (cmd.category === category && cmd.name !== 'menu' && !seen.has(cmd.name)) {
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

  const text = message.text?.body || '';
  const body = text.trim();
  if (!body) return;

  console.log(`Pesan masuk dari ${from}: ${text}`);

  const commandName = body.toLowerCase().split(' ')[0];
  const args = body.split(' ').slice(1);

  const commands = require('./commands');
  const cmd = commands.get(commandName);

  if (cmd) {
    await runCommand(commandName, { ...ctx, args });
    return;
  }

  try {
    const answer = await askGemini(body);
    await sendMessage(from, answer);
  } catch (e) {
    console.error('AI fallback error:', e.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server jalan di port ${PORT}`));
