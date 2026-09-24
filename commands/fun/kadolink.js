const { sendMessage } = require('../../lib/send-message');

function encodeMessage(text) {
  const b64 = Buffer.from(text, 'utf8').toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function getBaseUrl() {
  if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL.replace(/\/$/, '');
  if (process.env.RAILWAY_PUBLIC_DOMAIN) return 'https://' + process.env.RAILWAY_PUBLIC_DOMAIN;
  return 'https://panzz-cloud-api.up.railway.app';
}

module.exports = {
  name: 'kadolink',
  alias: ['kadounik', 'kadoviral', 'surat', 'confesslink'],
  category: 'fun',
  description: 'Bikin link kado rahasia interaktif',

  async run({ from, message, sendMessage }) {
    const raw = (message?.text?.body || '')
      .replace(/^\.?(kadolink|kadounik|kadoviral|surat|confesslink)\s+/i, '')
      .trim();

    if (!raw || raw === 'help') {
      return sendMessage(from,
        '🎁 *KADO RAHASIA (Link)*\n\n' +
        '*Format:* `kadolink <pesan rahasia>`\n\n' +
        '*Contoh:*\n' +
        '`kadolink Aku udah suka kamu dari lama...`\n\n' +
        'Bot bakal kasih link yang bisa kamu share ke siapa aja.\n' +
        'Dia tap link → muncul kado animasi → klik → muncul pesan rahasia kamu → dia pilih 1 dari 3 jawaban.'
      );
    }

    if (raw.length > 800) return sendMessage(from, '❌ Max 800 karakter.');
    if (raw.length < 3) return sendMessage(from, '❌ Minimal 3 karakter.');

    const encoded = encodeMessage(raw);
    const base = getBaseUrl();
    const link = `${base}/kado.html?m=${encoded}`;

    const warning = link.length > 500
      ? '\n\n⚠️ _Pesan panjang, link jadi panjang._'
      : '';

    await sendMessage(from,
      `🎁 *KADO RAHASIA SIAP!*\n\n` +
      `🔗 *Link:*\n${link}\n\n` +
      `*Cara pakai:*\n` +
      `1. Copy link di atas\n` +
      `2. Share ke orang yang kamu tuju\n` +
      `3. Dia buka → klik kado 🎁 → ada pesan rahasia\n\n` +
      `💡 _Cek link-nya dulu sebelum share._` +
      warning
    );
  },
};
