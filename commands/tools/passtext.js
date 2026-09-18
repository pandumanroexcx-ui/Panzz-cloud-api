const KATA = ['kucing','meja','langit','bintang','kopi','gunung','laut','buku','pohon','api',
  'hujan','awan','burung','kembang','bulan','matahari','angin','salju','batu','pasir',
  'sungai','danau','hutan','bunga','daun','akar','cabang','rumput','tanah','langit',
  'pintu','jendela','kursi','lemari','cermin','lampu','tikar','bantal','selimut','karpet',
  'roti','nasi','sayur','buah','daging','ikan','telur','susu','gula','garam'];

function generatePassphrase(jumlah = 4) {
  const picks = [];
  for (let i = 0; i < jumlah; i++) {
    picks.push(KATA[Math.floor(Math.random() * KATA.length)]);
  }
  // Tambah angka random di tengah
  const idx = Math.floor(Math.random() * picks.length);
  picks[idx] = picks[idx].charAt(0).toUpperCase() + picks[idx].slice(1) + Math.floor(Math.random() * 100);
  return picks.join('-');
}

module.exports = {
  name: 'passtext',
  alias: ['passphrase', 'passwordkata'],
  category: 'tools',
  description: 'Generate passphrase dari kata (mudah diingat)',

  async run({ from, args, sendMessage }) {
    const jumlah = parseInt(args?.[0], 10) || 4;
    if (jumlah < 3 || jumlah > 6) return sendMessage(from, '❌ Jumlah kata 3-6.');

    const pass = generatePassphrase(jumlah);
    await sendMessage(from,
      `🔐 *PASSPHRASE GENERATOR*\n\n` +
      `\`${pass}\`\n\n` +
      `📏 ${jumlah} kata\n` +
      `💡 Lebih mudah diingat dari password random`
    );
  },
};
