const { setPending, getPending, clearPending } = require('../../lib/pending-downloads');

const KATA = [
  'kucing', 'matahari', 'sepeda', 'gunung', 'apel', 'handphone', 'sekolah',
  'buku', 'pensil', 'hujan', 'bunga', 'ikan', 'burung', 'komputer', 'meja',
  'kursi', 'pintu', 'jendela', 'lampu', 'bantal', 'kasur', 'selimut', 'baju',
  'celana', 'sepatu', 'topi', 'jam', 'cermin', 'sabun', 'sikat', 'piring',
  'gelas', 'sendok', 'garpu', 'pisau', 'panci', 'wajan', 'kompor', 'kulkas',
  'lemari', 'rak', 'sapu', 'pel', 'ember', 'gayung', 'handuk',
];

function scramble(word) {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const result = arr.join('');
  return result === word ? scramble(word) : result;
}

module.exports = {
  name: 'scramble',
  alias: ['acakkata', 'susunkata'],
  category: 'fun',
  description: 'Game susun kata acak',

  async run({ from, args, sendMessage, message }) {
    const key = `scramble:${from}`;

    if (args?.[0] === 'nyerah' || args?.[0] === 'stop') {
      const pending = getPending(key);
      if (pending) {
        clearPending(key);
        await sendMessage(from, `😅 Jawabannya: *${pending.word}*`);
      } else {
        await sendMessage(from, '❌ Kamu lagi gak main.');
      }
      return;
    }

    const pending = getPending(key);
    if (pending) {
      const jawab = (args?.join(' ') || '').toLowerCase().trim();
      if (jawab === pending.word) {
        clearPending(key);
        await sendMessage(from, `🎉 *BENER!* Jawabannya: *${pending.word}*\n\nMain lagi? \`scramble\``);
      } else {
        await sendMessage(from, `❌ Salah! Coba lagi.\n\n_Atau ketik \`scramble nyerah\` buat nyerah._`);
      }
      return;
    }

    const word = KATA[Math.floor(Math.random() * KATA.length)];
    const acak = scramble(word);
    setPending(key, { word });
    await sendMessage(from,
      `🔤 *SUSUN KATA*\n\n` +
      `Kata acak: *${acak.toUpperCase()}*\n\n` +
      `Susun ulang jadi kata yang benar!\n` +
      `_Ketik jawabanmu, atau \`scramble nyerah\`._`
    );
  },
};
