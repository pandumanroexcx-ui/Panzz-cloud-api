function faktorial(n) {
  if (n < 0) return null;
  if (n > 170) return Infinity; // Melebihi batas Number
  let hasil = 1;
  for (let i = 2; i <= n; i++) hasil *= i;
  return hasil;
}

module.exports = {
  name: 'faktorial',
  alias: ['factorial', 'fakt'],
  category: 'tools',
  description: 'Hitung faktorial (n!)',

  async run({ from, args, sendMessage }) {
    const n = parseInt(args?.[0], 10);
    if (isNaN(n) || n < 0 || n > 170) {
      return sendMessage(from,
        '🔢 *FAKTORIAL*\n\n' +
        '*Format:* `faktorial <n>`\n\n' +
        '*Contoh:*\n' +
        '• `faktorial 5` → 5! = 120\n' +
        '• `faktorial 10` → 10! = 3.628.800\n' +
        '• `faktorial 0` → 0! = 1\n\n' +
        '*Range:* 0-170 (di atas itu hasilnya terlalu besar)*'
      );
    }

    const hasil = faktorial(n);
    const formula = n <= 10 ? Array.from({ length: n }, (_, i) => i + 1).join(' × ') || '1' : `${n}!`;

    await sendMessage(from,
      `🔢 *FAKTORIAL*\n\n` +
      `📊 n = ${n}\n` +
      `🧮 Rumus: ${formula}${n > 10 ? '' : ' = ' + hasil.toExponential(4)}\n\n` +
      `✅ *${n}! = ${hasil.toLocaleString('id-ID')}*`
    );
  },
};
