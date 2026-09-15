const { uploadImage } = require('../../lib/whatsapp-media');
const { sendImage } = require('../../lib/send-message');

module.exports = {
  name: 'qr',
  alias: ['qrcode', 'barcode'],
  category: 'tools',
  description: 'Generate QR Code dari teks / link',

  async run({ from, args, sendMessage }) {
    if (!args?.[0]) {
      return sendMessage(from, '📝 Format: qr <teks>\nContoh: qr https://google.com\nAtau: qr Halo dunia');
    }

    const text = args.join(' ');
    if (text.length > 500) return sendMessage(from, '❌ Teks kepanjangan (max 500).');

    await sendMessage(from, '🔲 Lagi bikin QR...');

    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(text)}`;
      const res = await fetch(qrUrl, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error('Gagal bikin QR');

      const buffer = Buffer.from(await res.arrayBuffer());
      const mediaId = await uploadImage(buffer, 'qr.png');
      await sendImage(from, mediaId, `🔲 QR Code\n\n📝 Isi: ${text.slice(0, 100)}${text.length > 100 ? '...' : ''}`);
    } catch (e) {
      console.error('[QR]', e.message);
      await sendMessage(from, '⚠️ Gagal bikin QR, coba lagi 🙏');
    }
  },
};
