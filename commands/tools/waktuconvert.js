const UNITS = {
  detik: 1, s: 1, sec: 1,
  menit: 60, m: 60, min: 60,
  jam: 3600, j: 3600, h: 3600, hour: 3600,
  hari: 86400, d: 86400, day: 86400,
  minggu: 604800, w: 604800, week: 604800,
  bulan: 2592000, mo: 2592000, month: 2592000,
  tahun: 31536000, y: 31536000, year: 31536000,
};

module.exports = {
  name: 'waktuconvert',
  alias: ['wc', 'convertwaktu'],
  category: 'tools',
  description: 'Konversi satuan waktu',

  async run({ from, args, sendMessage }) {
    const nilai = parseFloat(args?.[0]);
    const dari = (args?.[1] || '').toLowerCase();
    const ke = (args?.[2] || '').toLowerCase();

    if (isNaN(nilai) || !UNITS[dari] || !UNITS[ke]) {
      return sendMessage(from,
        '⏱️ *KONVERSI WAKTU*\n\n' +
        '*Format:* `wc <nilai> <dari> <ke>`\n\n' +
        '*Contoh:*\n' +
        '• `wc 2 jam menit`\n' +
        '• `wc 1 hari detik`\n' +
        '• `wc 30 hari bulan`\n' +
        '• `wc 1 tahun hari`\n\n' +
        '*Satuan:* detik, menit, jam, hari, minggu, bulan, tahun'
      );
    }

    const hasil = (nilai * UNITS[dari]) / UNITS[ke];

    let formatted = hasil;
    if (Math.abs(hasil) < 0.001) formatted = hasil.toExponential(4);
    else if (!Number.isInteger(hasil)) formatted = hasil.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
    else formatted = hasil.toString();

    // Bonus: kasih breakdown
    let breakdown = '';
    if (dari === 'detik' || dari === 's') {
      const total = nilai;
      const hari = Math.floor(total / 86400);
      const jam = Math.floor((total % 86400) / 3600);
      const menit = Math.floor((total % 3600) / 60);
      const det = total % 60;
      const parts = [];
      if (hari) parts.push(`${hari} hari`);
      if (jam) parts.push(`${jam} jam`);
      if (menit) parts.push(`${menit} menit`);
      if (det) parts.push(`${det} detik`);
      breakdown = `\n\n📋 = ${parts.join(', ')}`;
    }

    await sendMessage(from, `⏱️ *KONVERSI WAKTU*\n\n${nilai} ${dari} = *${formatted} ${ke}*${breakdown}`);
  },
};
