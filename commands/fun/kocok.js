function kocokKata(text) {
  if (text.length <= 3) return text;
  const first = text[0];
  const last = text[text.length - 1];
  const middle = text.slice(1, -1).split('');
  // Fisher-Yates shuffle
  for (let i = middle.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [middle[i], middle[j]] = [middle[j], middle[i]];
  }
  return first + middle.join('') + last;
}

module.exports = {
  name: 'kocok',
  alias: ['shuffle', 'acak'],
  category: 'fun',
  description: 'Kocok huruf dalam kata (challenge baca)',

  async run({ from, args, sendMessage }) {
    const text = args.join(' ').trim();
    if (!text) return sendMessage(from, '🔀 Format: `kocok <teks>`\n\nContoh: `kocok bahasa indonesia seru`');

    const hasil = text.split(' ').map(kocokKata).join(' ');
    await sendMessage(from,
      `🔀 *KATA DIKOCOK*\n\n` +
      `Input: ${text}\n\n` +
      `Hasil:\n*${hasil}*\n\n` +
      `_Coba baca pelan-pelan 😆_`
    );
  },
};
