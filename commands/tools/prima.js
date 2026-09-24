function isPrime(n) {
  if (n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

module.exports = {
  name: 'prima',
  alias: ['cekprima', 'bilanganprima'],
  category: 'tools',
  description: 'Cek & generate bilangan prima',

  async run({ from, args, sendMessage }) {
    const sub = args?.[0]?.toLowerCase();

    // cek <angka>
    if (sub === 'cek') {
      const n = parseInt(args[1], 10);
      if (isNaN(n) || n < 1 || n > 1000000) return sendMessage(from, '❌ Format: `prima cek <angka>` (1-1.000.000)');
      const prima = isPrime(n);
      return sendMessage(from, `${prima ? '✅' : '❌'} *${n}* ${prima ? 'BILANGAN PRIMA' : 'BUKAN bilangan prima'}`);
    }

    // list <n> — list prima sampai n
    if (sub === 'list') {
      const n = parseInt(args[1], 10);
      if (isNaN(n) || n < 2 || n > 1000) return sendMessage(from, '❌ Format: `prima list <n>` (2-1000)');
      const list = [];
      for (let i = 2; i <= n; i++) if (isPrime(i)) list.push(i);
      return sendMessage(from,
        `🔢 *PRIMA SAMPAI ${n}*\n\n` +
        `📊 Jumlah: *${list.length}*\n\n` +
        `${list.join(', ')}`
      );
    }

    // nth — prima ke-n
    if (sub === 'nth') {
      const n = parseInt(args[1], 10);
      if (isNaN(n) || n < 1 || n > 10000) return sendMessage(from, '❌ Format: `prima nth <n>` (1-10.000)');
      let count = 0, num = 1;
      while (count < n) { num++; if (isPrime(num)) count++; }
      return sendMessage(from, `🔢 Prima ke-*${n}* adalah *${num}*`);
    }

    // cek <angka> sebagai default
    const n = parseInt(args?.[0], 10);
    if (!isNaN(n)) {
      const prima = isPrime(n);
      return sendMessage(from, `${prima ? '✅' : '❌'} *${n}* ${prima ? 'BILANGAN PRIMA' : 'BUKAN bilangan prima'}`);
    }

    return sendMessage(from,
      '🔢 *BILANGAN PRIMA*\n\n' +
      '• `prima 17` — cek apakah prima\n' +
      '• `prima cek 17`\n' +
      '• `prima list 100` — list prima ≤ 100\n' +
      '• `prima nth 10` — prima ke-10\n\n' +
      '_Range: 1-1.000.000_'
    );
  },
};
