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

  async run({ from, args, sendMessage }) {
    if (args?.[0] === 'stop' || args?.[0] === 'nyerah') {
      const pending = getPending(`game:${from}`);
      if (pending) {
        clearPending(`game:${from}`);
        await sendMessage(from, `😅 Yaudah, jawabannya: *${pending.word}*`);
      } else {
        await sendMessage(from, '❌ Kamu lagi gak main tebak kata.');
      }
      return;
    }

    // Cek kalau user lagi main, cek jawaban
    const pending = getPending(`game:${from}`);
    if (pending) {
      const guess = (args?.[0] || '').toLowerCase();
      if (guess === pending.word) {
        clearPending(`game:${from}`);
        await sendMessage(from, `🎉 *BENER!* Jawabannya: *${pending.word}*\n\nMain lagi? Ketik *.tebak*`);
      } else {
        await sendMessage(from, `❌ Salah! Coba lagi.\n\n💡 Hint: ${pending.hint}\n\nKetik *.tebak nyerah* buat nyerah.`);
      }
      return;
    }

    // Mulai game baru
    const picked = WORDS[Math.floor(Math.random() * WORDS.length)];
    const revealed = [0]; // kasih huruf pertama
    setPending(`game:${from}`, { word: picked.word, hint: picked.hint });

    await sendMessage(from,
      `🎮 *TEBAK KATA*\n\n` +
      `Kata: \`${mask(picked.word, revealed)}\`\n` +
      `💡 Hint: ${picked.hint}\n\n` +
      `Ketik jawabanmu langsung (1 kata).\n` +
      `Ketik *.tebak nyerah* buat nyerah.`
    );
  },
};
