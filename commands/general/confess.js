const { sendConfess } = require('../../lib/confess');

module.exports = {
  name: 'confess',
  alias: ['confes'],
  category: 'general',
  description: 'Kirim pesan rahasia anonim ke seseorang',

  async run({ from, args, sendMessage }) {
    if (!args || args.length < 3) {
      await sendMessage(from,
        '📝 *Format:* confess <nomor> <nama> <pesan>\n\n' +
        '*Contoh:*\n' +
        'confess 628123456789 Sarah Aku suka kamu dari dulu\n\n' +
        '📌 *Catatan:*\n' +
        '• Target harus pernah chat bot ini (dalam 24 jam)\n' +
        '• Nama dipake buat inisial (misal "Sarah" → "S")\n' +
        '• Pesan max 500 karakter'
      );
      return;
    }

    const targetNumber = args[0];
    const targetName = args[1];
    const confessMessage = args.slice(2).join(' ');

    const result = await sendConfess(from, targetNumber, targetName, confessMessage);
    if (result.ok) {
      await sendMessage(from,
        `✅ *Confess terkirim!*\n\n` +
        `Ke: ${result.target}\n` +
        `Pengirim tampil sebagai: *${result.initials}*\n\n` +
        `_Anonim via Panzz Bot_`
      );
    } else {
      await sendMessage(from, `❌ ${result.error}`);
    }
  },
};
