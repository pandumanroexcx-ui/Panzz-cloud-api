const SUIT = {
  '♠': { nama: 'Sekop', warna: 'Hitam', emoji: '♠️' },
  '♥': { nama: 'Hati', warna: 'Merah', emoji: '♥️' },
  '♦': { nama: 'Wajik', warna: 'Merah', emoji: '♦️' },
  '♣': { nama: 'Keriting', warna: 'Hitam', emoji: '♣️' },
};
const NILAI = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

module.exports = {
  name: 'kartu',
  alias: ['card', 'remi'],
  category: 'fun',
  description: 'Random kartu remi',

  async run({ from, args, sendMessage }) {
    const jumlah = parseInt(args?.[0], 10) || 1;
    if (jumlah < 1 || jumlah > 5) return sendMessage(from, '❌ Jumlah kartu 1-5.');

    const kartu = [];
    const deck = [];
    for (const s of Object.keys(SUIT)) {
      for (const n of NILAI) deck.push({ suit: s, nilai: n });
    }

    for (let i = 0; i < jumlah; i++) {
      const idx = Math.floor(Math.random() * deck.length);
      kartu.push(deck.splice(idx, 1)[0]);
    }

    const lines = kartu.map((k, i) => {
      const s = SUIT[k.suit];
      const display = `${s.emoji} ${k.nilai}${k.suit}`;
      return `*${i + 1}.* ${display} — ${s.nama} ${s.warna}`;
    });

    await sendMessage(from, `🃏 *KARTU REMI*\n\n${lines.join('\n')}`);
  },
};
