const express = require('express');
const { VERIFY_TOKEN } = require('./config');
const {
  sendMessage, sendVideo, sendAudio, sendImage,
  sendButtons, sendList, sendSticker,
  markAsRead, sendTyping,
} = require('./lib/send-message');
const { askGemini, askGeminiWithImage } = require('./lib/ai-client');
const { clearHistory } = require('./lib/ai-memory');
const { recordChat } = require('./lib/confess-store');
const { downloadMedia, uploadSticker, relayUrlToMediaId, relayVideoUrlToAudioMediaId } = require('./lib/whatsapp-media');
const { imageToSticker } = require('./lib/sticker');
const { isDuplicate } = require('./lib/dedup');
const { detectLink } = require('./lib/link-detect');
const { setPending, getPending, clearPending } = require('./lib/pending-downloads');
const { download } = require('./lib/downloader');
const { startReminderWorker } = require('./lib/reminder-store');
const { startRoutineWorker } = require('./lib/routine-store');
const { checkRateLimit } = require('./lib/rate-limit');

const app = express();
app.use(express.json());

const CATEGORY_EMOJI = { general: '📋', fun: '🎮', tools: '🛠️', ai: '🤖', downloader: '📥' };

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
    await sendMessage(ctx.from, '⚠️ Command-nya lagi error, coba lagi nanti ya 🙏');
  }
  return true;
}

async function processDownload(from, format) {
  const pendingItem = getPending(from);
  if (!pendingItem) {
    await sendMessage(from, 'Link-nya udah kadaluarsa, kirim ulang linknya ya.');
    return;
  }
  clearPending(from);
  await sendMessage(from, '⏳ Lagi diproses, sabar ya...');

  try {
    const result = await download(pendingItem.platform, pendingItem.url);
    const extraHeaders = result.videoHeaders || {};

    if (format === 'mp3') {
      if (!result.audioUrl) throw new Error('Ga ada versi audio buat link ini.');
      let mediaId;
      if (result.audioFromVideo) {
        mediaId = await relayVideoUrlToAudioMediaId(result.audioUrl, extraHeaders);
      } else {
        const mime = result.audioMime || 'audio/mpeg';
        const ext = result.audioExt || 'mp3';
        mediaId = await relayUrlToMediaId(result.audioUrl, mime, `audio.${ext}`, extraHeaders);
      }
      await sendAudio(from, mediaId, true);
    } else if (format === 'image') {
      if (!result.imageUrl) throw new Error('Ga ada versi gambar buat link ini.');
      const mediaId = await relayUrlToMediaId(result.imageUrl, 'image/jpeg', 'image.jpg', extraHeaders);
      await sendImage(from, mediaId);
    } else {
      if (!result.videoUrl) throw new Error('Ga ada versi video buat link ini.');
      const mediaId = await relayUrlToMediaId(result.videoUrl, 'video/mp4', 'video.mp4', extraHeaders);
      await sendVideo(from, mediaId, '', true);
    }
  } catch (e) {
    console.error('Download error detail:', e.message);
    await sendMessage(from, '⚠️ Gagal download. Coba lagi nanti ya 🙏');
  }
}

app.post('/webhook', async (req, res) => {
  res.sendStatus(200);

  const entry = req.body.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;
  const message = value?.messages?.[0];
  if (!message) return;
  if (isDuplicate(message.id)) return;

  const from = message.from;

  const rl = checkRateLimit(from);
  if (!rl.allowed) {
    console.log(`[RATE-LIMIT] ${from} spam`);
    return;
  }

  recordChat(from);
  markAsRead(message.id).catch(() => {});
  sendTyping(from, message.id).catch(() => {});

  const ctx = { sendMessage, sendImage, sendList, from, message };

  if (message.type === 'image') {
    const caption = (message.image.caption || '').trim().toLowerCase();
    try {
      const { buffer, mimeType } = await downloadMedia(message.image.id);
      if (caption === 'sticker' || caption === 'stiker') {
        const webpBuffer = await imageToSticker(buffer);
        const mediaId = await uploadSticker(webpBuffer);
        await sendSticker(from, mediaId);
      } else {
        const answer = await askGeminiWithImage(from, message.image.caption || '', buffer, mimeType);
        await sendMessage(from, answer);
      }
    } catch (e) {
      console.error('Gagal proses gambar:', e.message);
      await sendMessage(from, '⚠️ Gagal proses gambar itu, coba lagi 🙏');
    }
    return;
  }

  if (message.type === 'audio') {
    try {
      const { buffer, mimeType } = await downloadMedia(message.audio.id);
      const answer = await askGeminiWithImage(from, 'Transkrip audio ini ke teks, lalu kasih ringkasan singkat.', buffer, mimeType);
      await sendMessage(from, answer);
    } catch (e) {
      console.error('Gagal transkrip audio:', e.message);
      await sendMessage(from, '⚠️ Gagal transkrip voice note, coba lagi 🙏');
    }
    return;
  }

  if (message.type === 'interactive' && message.interactive?.type === 'button_reply') {
    const id = message.interactive.button_reply.id;
    if (id === 'dl_mp3') await processDownload(from, 'mp3');
    else if (id === 'dl_mp4') await processDownload(from, 'mp4');
    else if (id === 'dl_image') await processDownload(from, 'image');
    return;
  }

  if (message.type === 'interactive' && message.interactive?.type === 'list_reply') {
    const id = message.interactive.list_reply.id;

    if (id.startsWith('cat:')) {
      const parts = id.split(':');
      const category = parts[1];
      const page = parseInt(parts[2] || '0', 10);

      const commands = require('./commands');
      const rows = [];
      const seen = new Set();
      for (const cmd of commands.values()) {
        if (cmd.category === category && cmd.name !== 'menu' && !seen.has(cmd.name)) {
          seen.add(cmd.name);
          rows.push({ id: cmd.name, title: cmd.name, description: cmd.description || '' });
        }
      }

      const PER_PAGE = 10;
      const totalPages = Math.ceil(rows.length / PER_PAGE);
      const start = page * PER_PAGE;
      const pageRows = rows.slice(start, start + PER_PAGE);

      if (page < totalPages - 1) {
        pageRows.push({
          id: `cat:${category}:${page + 1}`,
          title: `➡️ Halaman ${page + 2}`,
          description: `Lihat ${Math.min(PER_PAGE, rows.length - start - PER_PAGE)} command lagi`,
        });
      }

      const emoji = CATEGORY_EMOJI[category] || '📁';
      const pageInfo = totalPages > 1 ? ` (Hal ${page + 1}/${totalPages})` : '';

      await sendList(from, {
        header: `${emoji} ${category.toUpperCase()}${pageInfo}`,
        body: `Ada *${rows.length}* command di kategori ini.\nTap buat langsung jalanin:`,
        buttonText: 'Lihat Command',
        sections: [{ title: `${emoji} ${category.toUpperCase()}`, rows: pageRows }],
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

  const lowerBody = body.toLowerCase();

  if (lowerBody === 'reset' || lowerBody === 'clear' || lowerBody === '/reset') {
    clearHistory(from);
    await sendMessage(from, '✅ History obrolan dihapus. Mulai dari awal lagi ya.');
    return;
  }

  const linkInfo = detectLink(body);
  if (linkInfo) {
    setPending(from, linkInfo);

    let buttons;
    if (linkInfo.platform === 'instagram') {
      buttons = [
        { id: 'dl_mp4', title: 'Video' },
        { id: 'dl_image', title: 'Gambar' },
        { id: 'dl_mp3', title: 'Lagu' },
      ];
    } else {
      buttons = [
        { id: 'dl_mp4', title: 'MP4 (Video)' },
        { id: 'dl_mp3', title: 'MP3 (Audio)' },
      ];
    }

    await sendButtons(from, {
      body: `Link ${linkInfo.platform} terdeteksi! Mau download format apa?`,
      buttons,
    });
    return;
  }

  const tebakPending = getPending(`game:${from}`);
  if (tebakPending) {
    const handled = await runCommand('tebak', { ...ctx, args: body.split(' ') });
    if (handled) return;
  }

  const kuisPending = getPending(`kuis:${from}`);
  if (kuisPending) {
    const handled = await runCommand('kuis', { ...ctx, args: body.split(' ') });
    if (handled) return;
  }

  const commands = require('./commands');
  const commandName = lowerBody.split(' ')[0];
  const args = body.split(' ').slice(1);
  const cmd = commands.get(commandName);

  if (cmd) {
    await runCommand(commandName, { ...ctx, args });
    return;
  }

  try {
    const answer = await askGemini(from, body);
    await sendMessage(from, answer);
  } catch (e) {
    console.error('AI fallback error:', e.message);
    await sendMessage(from, '⚠️ AI lagi sibuk, coba lagi nanti 🙏');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
  startReminderWorker();
  startRoutineWorker();
  console.log('[WORKER] Reminder + Routine aktif');
});
