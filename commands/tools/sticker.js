const { uploadSticker } = require('../../lib/whatsapp-media');
const { imageToSticker } = require('../../lib/sticker');
const { sendSticker } = require('../../lib/send-message');

module.exports = {
  name: 'sticker',
  alias: ['stiker', 'stikerin'],
  category: 'tools',
  description: 'Bikin sticker dari link gambar',

  async run({ from, args, sendMessage }) {
    if (!args?.[0] || !args[0].startsWith('http')) {
      return sendMessage(from, '📝 Format: sticker <url_gambar>\nContoh: sticker https://i.imgur.com/xxx.jpg');
    }

    await sendMessage(from, '🎨 Lagi bikin sticker...');

    try {
      const res = await fetch(args[0], {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`Gagal download gambar (${res.status})`);

      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length < 1000) throw new Error('Gambar kekecilan / link rusak.');

      const webpBuffer = await imageToSticker(buffer);
      const mediaId = await uploadSticker(webpBuffer);
      await sendSticker(from, mediaId);
    } catch (e) {
      console.error('[STICKER]', e.message);
      await sendMessage(from, '⚠️ Gagal bikin sticker, coba lagi 🙏');
    }
  },
};
