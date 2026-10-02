const { setMemory, getMemory, deleteMemory } = require('../../lib/memory');

module.exports = {
  name: 'panggil',
  alias: ['nickname', 'namabot', 'callme'],
  category: 'tools',
  description: 'Kasih nama panggilan ke bot',

  async run({ from, args, sendMessage }) {
    const sub = (args?.[0] || '').toLowerCase();

    if (sub === 'reset' || sub === 'hapus') {
      const old = getMemory(from).bot_nickname;
      deleteMemory(from, 'bot_nickname');
      return sendMessage(from, old ? `✅ Nama panggilan *${old}* dihapus.` : '❌ Belum ada nama panggilan.');
    }

    if (!args?.length) {
      const current = getMemory(from).bot_nickname;
      return sendMessage(from,
        '📛 *NAMA PANGGILAN BOT*\n\n' +
        (current ? `Sekarang kamu panggil aku: *${current}*\n\n` : '') +
        '*Format:* `panggil <nama>`\n\n' +
        '*Contoh:*\n' +
        '• `panggil Sayang`\n' +
        '• `panggil Bro`\n' +
        '• `panggil Panzz`\n' +
        '• `panggil AI`\n\n' +
        '*Reset:* `panggil reset`'
      );
    }

    const nama = args.join(' ').trim();
    if (nama.length > 30) return sendMessage(from, '❌ Max 30 karakter.');
    setMemory(from, 'bot_nickname', nama);
    await sendMessage(from, `✅ Oke, mulai sekarang panggil aku *${nama}* ya! 😊`);
  },
};
