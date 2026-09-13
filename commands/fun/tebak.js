const { setPending, getPending, clearPending } = require('../../lib/pending-downloads');

const WORDS = [
  { word: 'kucing', hint: 'Hewan berkaki empat, suka makan ikan' },
  { word: 'matahari', hint: 'Benda langit yang terbit pagi' },
  { word: 'sepeda', hint: 'Kendaraan roda dua, dikayuh' },
  { word: 'gunung', hint: 'Dataran yang tinggi banget' },
  { word: 'apel', hint: 'Buah warna merah, favorit guru' },
  { word: 'pisang', hint: 'Buah warna kuning, monyet suka' },
  { word: 'handphone', hint: 'Benda yang kamu pegang sekarang' },
  { word: 'sekolah', hint: 'Tempat belajar' },
  { word: 'buku', hint: 'Kumpulan kertas berisi tulisan' },
  { word: 'pensil', hint: 'Buat nulis, ada penghapusnya' },
  { word: 'hujan', hint: 'Air turun dari langit' },
  { word: 'bunga', hint: 'Warnanya cantik, baunya wangi' },
  { word: 'ikan', hint: 'Hewan yang hidup di air' },
  { word: 'burung', hint: 'Hewan yang bisa terbang' },
  { word: 'komputer', hint: 'Benda buat kerja, ada keyboardnya' },
];

function mask(word, revealed = []) {
  return word.split('').map((c, i) => (revealed.includes(i) ? c : '_')).join(' ');
}

module.exports = {
  name: 'tebak',
  alias: ['tebakkkata', 'guess'],
  category: 'fun',
  description: 'Main tebak kata',

  async run({ from, args, sendMessage, message, botMessageId }) {
    const key = `game:${from}`;

    if (args?.[0] === 'stop' || args?.[0] === 'nyerah') {
      const pending = getPending(key);
      if (pending) {
        clearPending(key);
        await sendMessage(from, `😅 Yaudah, jawabannya: *${pending.word}*`);
      } else {
        await sendMessage(from, '❌ Kamu lagi gak main tebak kata.');
      }
      return;
    }

    const pending = getPending(key);

    // Kalau ada pending, dan user reply pesan bot (atau ketik command)
    if (pending) {
      const isReplyToGame = message?.context?.id === pending.messageId;
      const isCommand = args?.[0] === 'tebak' || message?.text?.body?.toLowerCase().startsWith('tebak');

      // Kalau BUKAN reply ke pesan game DAN bukan command → jangan proses
      if (!isReplyToGame && !isCommand) {
        return false; // biarin AI/command lain handle
      }

      // Kalau reply tapi bukan ke pesan game → jangan proses
      if (message?.context?.id && !isReplyToGame) {
        return false;
      }

      const guess = (args?.[0] || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (guess === pending.word) {
        clearPending(key);
        await sendMessage(from, `🎉 *BENER!* Jawabannya: *${pending.word}*\n\nMain lagi? Ketik *.tebak*`);
      } else {
        await sendMessage(from,
          `❌ Salah! Coba lagi.\n\n` +
          `💡 Hint: ${pending.hint}\n\n` +
          `Reply pesan soal ini buat jawab, atau ketik *.tebak nyerah*.`,
          { reply_to: pending.messageId }
        );
      }
      return;
    }

    // Mulai game baru
    const picked = WORDS[Math.floor(Math.random() * WORDS.length)];
    const revealed = [0];
    const text =
      `🎮 *TEBAK KATA*\n\n` +
      `Kata: \`${mask(picked.word, revealed)}\`\n` +
      `💡 Hint: ${picked.hint}\n\n` +
      `📌 *Balas/reply pesan ini* buat jawab.\n` +
      `Atau ketik *.tebak nyerah* buat nyerah.`;

    const sent = await sendMessage(from, text);
    const sentId = sent?.messages?.[0]?.id;

    setPending(key, { word: picked.word, hint: picked.hint, messageId: sentId });
  },
};
