const ROMAWI = [
  { v: 1000, s: 'M' }, { v: 900, s: 'CM' }, { v: 500, s: 'D' }, { v: 400, s: 'CD' },
  { v: 100, s: 'C' }, { v: 90, s: 'XC' }, { v: 50, s: 'L' }, { v: 40, s: 'XL' },
  { v: 10, s: 'X' }, { v: 9, s: 'IX' }, { v: 5, s: 'V' }, { v: 4, s: 'IV' },
  { v: 1, s: 'I' },
];

function toRoman(n) {
  if (n < 1 || n > 3999) return null;
  let hasil = '';
  for (const r of ROMAWI) {
    while (n >= r.v) { hasil += r.s; n -= r.v; }
  }
  return hasil;
}

function fromRoman(s) {
  const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  const upper = s.toUpperCase();
  for (let i = 0; i < upper.length; i++) {
    const curr = map[upper[i]];
    const next = map[upper[i + 1]];
    if (!curr) return null;
    if (next && curr < next) total -= curr;
    else total += curr;
  }
  return total;
}

module.exports = {
  name: 'romawi',
  alias: ['roman', 'angkasamawi'],
  category: 'tools',
  description: 'Konversi angka ↔ Romawi',

  async run({ from, args, sendMessage }) {
    const input = args?.[0];
    if (!input) {
      return sendMessage(from,
        '🔢 *KONVERSI ROMAWI*\n\n' +
        '*Format:*\n' +
        '• `romawi 2024` — angka ke romawi\n' +
        '• `romawi MMXXIV` — romawi ke angka\n\n' +
        '*Contoh:*\n' +
        '• `romawi 1990`\n' +
        '• `romawi MCMXC`'
      );
    }

    // Coba sebagai angka
    if (/^\d+$/.test(input)) {
      const n = parseInt(input, 10);
      const result = toRoman(n);
      if (!result) return sendMessage(from, '❌ Angka harus 1-3999.');
      return sendMessage(from,
        `🔢 *KONVERSI ROMAWI*\n\n` +
        `📊 Angka: *${n}*\n` +
        `🏛️ Romawi: *${result}*`
      );
    }

    // Coba sebagai romawi
    if (/^[IVXLCDM]+$/i.test(input)) {
      const result = fromRoman(input);
      if (result === null || result < 1) return sendMessage(from, '❌ Romawi gak valid.');
      return sendMessage(from,
        `🔢 *KONVERSI ROMAWI*\n\n` +
        `🏛️ Romawi: *${input.toUpperCase()}*\n` +
        `📊 Angka: *${result}*`
      );
    }

    return sendMessage(from, '❌ Input gak valid. Pake angka (1-3999) atau romawi (I, V, X, L, C, D, M).');
  },
};
