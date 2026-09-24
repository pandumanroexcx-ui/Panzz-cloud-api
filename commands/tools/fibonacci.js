module.exports = {
  name: 'fibonacci',
  alias: ['fib', 'deretfibonacci'],
  category: 'tools',
  description: 'Generate deret Fibonacci',

  async run({ from, args, sendMessage }) {
    const jumlah = parseInt(args?.[0], 10) || 10;
    if (jumlah < 1 || jumlah > 50) {
      return sendMessage(from,
        '🔢 *DERET FIBONACCI*\n\n' +
        '*Format:* `fibonacci [jumlah]`\n\n' +
        '*Contoh:*\n' +
        '• `fibonacci` — 10 angka (default)\n' +
        '• `fibonacci 15` — 15 angka\n' +
        '• `fibonacci 20`\n\n' +
        '*Range:* 1-50'
      );
    }

    const fib = [0, 1];
    for (let i = 2; i < jumlah; i++) {
      fib.push(fib[i - 1] + fib[i - 2]);
    }
    const result = fib.slice(0, jumlah);

    // Bagi jadi beberapa baris biar gak kepanjangan
    const lines = [];
    for (let i = 0; i < result.length; i += 5) {
      lines.push(result.slice(i, i + 5).join(' · '));
    }

    await sendMessage(from,
      `🔢 *DERET FIBONACCI (${jumlah})*\n\n` +
      `${lines.join('\n')}\n\n` +
      `_Total angka: ${jumlah}_`
    );
  },
};
