function isPrime(n) {
  if (n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

function faktorisasi(n) {
  const faktor = [];
  let sisa = n;
  for (let i = 2; i <= sisa; i++) {
    while (sisa % i === 0) { faktor.push(i); sisa /= i; }
  }
  return faktor;
}

module.exports = {
  name: 'math',
  alias: ['cekangka', 'angkajaib'],
  category: 'tools',
  description: 'Analisis angka (ganjil/genap/prima/dll)',

  async run({ from, args, sendMessage }) {
    const n = parseInt(args?.[0], 10);
    if (isNaN(n) || Math.abs(n) > 1000000) {
      return sendMessage(from,
        '🔢 *ANALISIS ANGKA*\n\n' +
        '*Format:* `math <angka>`\n\n' +
        '*Contoh:*\n' +
        '• `math 17`\n' +
        '• `math 100`\n' +
        '• `math 999`\n\n' +
        '_Max: 1.000.000_'
      );
    }

    const ganjilGenap = n % 2 === 0 ? '🔵 Genap' : '🔴 Ganjil';
    const prima = isPrime(n) ? '✅ Prima' : '❌ Bukan Prima';
    const kuadrat = Number.isInteger(Math.sqrt(n)) ? '✅ Kuadrat sempurna' : '❌ Bukan kuadrat sempurna';
    const nol = n === 0 ? '✅ Nol' : '❌ Bukan nol';
    const positifNegatif = n > 0 ? '➕ Positif' : n < 0 ? '➖ Negatif' : '⚪ Nol';

    const faktor = n > 0 && n <= 100000 ? faktorisasi(n) : null;
    const faktorText = faktor ? (faktor.length ? faktor.join(' × ') : 'Prima') : 'Terlalu besar';

    // Digit
    const digitCount = Math.abs(n).toString().length;
    const sumDigit = Math.abs(n).toString().split('').reduce((a, b) => a + parseInt(b), 0);

    // Palindrom
    const strN = Math.abs(n).toString();
    const palindrom = strN === strN.split('').reverse().join('') ? '✅ Palindrom' : '❌ Bukan palindrom';

    await sendMessage(from,
      `🔢 *ANALISIS ANGKA: ${n}*\n\n` +
      `🔹 *Ganjil/Genap:* ${ganjilGenap}\n` +
      `🔹 *Positif/Negatif:* ${positifNegatif}\n` +
      `🔹 *Prima:* ${prima}\n` +
      `🔹 *Nol:* ${nol}\n` +
      `🔹 *Kuadrat:* ${kuadrat}\n` +
      `🔹 *Palindrom:* ${palindrom}\n\n` +
      `━━━━━━━━━━━━━━\n` +
      `📏 *Jumlah digit:* ${digitCount}\n` +
      `➕ *Jumlah semua digit:* ${sumDigit}\n` +
      `🧮 *Faktorisasi:* ${faktorText}`
    );
  },
};
