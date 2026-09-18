const ZODIAK = [
  { nama: 'Capricorn', mulai: [12, 22], akhir: [1, 19], emoji: '♑' },
  { nama: 'Aquarius', mulai: [1, 20], akhir: [2, 18], emoji: '♒' },
  { nama: 'Pisces', mulai: [2, 19], akhir: [3, 20], emoji: '♓' },
  { nama: 'Aries', mulai: [3, 21], akhir: [4, 19], emoji: '♈' },
  { nama: 'Taurus', mulai: [4, 20], akhir: [5, 20], emoji: '♉' },
  { nama: 'Gemini', mulai: [5, 21], akhir: [6, 20], emoji: '♊' },
  { nama: 'Cancer', mulai: [6, 21], akhir: [7, 22], emoji: '♋' },
  { nama: 'Leo', mulai: [7, 23], akhir: [8, 22], emoji: '♌' },
  { nama: 'Virgo', mulai: [8, 23], akhir: [9, 22], emoji: '♍' },
  { nama: 'Libra', mulai: [9, 23], akhir: [10, 22], emoji: '♎' },
  { nama: 'Scorpio', mulai: [10, 23], akhir: [11, 21], emoji: '♏' },
  { nama: 'Sagittarius', mulai: [11, 22], akhir: [12, 21], emoji: '♐' },
];

const HARI_PASARAN = ['Legi', 'Pahing', 'Pon', 'Wage', 'Kliwon'];

function getZodiak(d, m) {
  for (const z of ZODIAK) {
    const [m1, d1] = z.mulai;
    const [m2, d2] = z.akhir;
    if (m1 === m2) { if (m === m1 && d >= d1 && d <= d2) return z; }
    else if (m1 > m2) { if ((m === m1 && d >= d1) || (m === m2 && d <= d2)) return z; }
    else { if ((m === m1 && d >= d1) || (m === m2 && d <= d2)) return z; }
  }
  return ZODIAK[0];
}

function getWeton(tanggal) {
  // Ref: 1 Januari 1900 = Senin Pahing
  const ref = new Date('1900-01-01T00:00:00Z').getTime();
  const diff = Math.floor((tanggal.getTime() - ref) / 86400000);
  const hariIdx = ((diff % 7) + 7 + 1) % 7; // 1900-01-01 = Senin (idx 1)
  const pasaranIdx = ((diff % 5) + 5) % 5;
  const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][hariIdx];
  const pasaran = HARI_PASARAN[(pasaranIdx + 1) % 5]; // 1 Jan 1900 = Pahing
  return `${hari} ${pasaran}`;
}

module.exports = {
  name: 'umur',
  alias: ['age', 'ultah'],
  category: 'tools',
  description: 'Hitung umur + zodiak + weton',

  async run({ from, args, sendMessage }) {
    if (!args?.[0]) {
      return sendMessage(from,
        '🎂 *HITUNG UMUR*\n\n' +
        '*Format:* `umur <DD/MM/YYYY>`\n\n' +
        '*Contoh:*\n' +
        '• `umur 15/08/2000`\n' +
        '• `umur 01/01/1995`\n\n' +
        '_Kasih juga zodiak & weton Jawa_'
      );
    }

    const match = args[0].match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (!match) return sendMessage(from, '❌ Format: `umur DD/MM/YYYY`\nContoh: `umur 15/08/2000`');

    const d = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const y = parseInt(match[3], 10);

    const lahir = new Date(y, m - 1, d);
    if (isNaN(lahir.getTime()) || lahir > new Date()) {
      return sendMessage(from, '❌ Tanggal gak valid.');
    }

    const now = new Date();
    let umurTahun = now.getFullYear() - y;
    let umurBulan = now.getMonth() - (m - 1);
    let umurHari = now.getDate() - d;

    if (umurHari < 0) {
      umurBulan--;
      const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      umurHari += lastMonth.getDate();
    }
    if (umurBulan < 0) { umurTahun--; umurBulan += 12; }

    const totalHari = Math.floor((now - lahir) / 86400000);
    const totalMinggu = Math.floor(totalHari / 7);
    const totalBulan = umurTahun * 12 + umurBulan;

    const zodiak = getZodiak(d, m);
    const weton = getWeton(lahir);

    // Ultah berikutnya
    let nextBday = new Date(now.getFullYear(), m - 1, d);
    if (nextBday < now) nextBday.setFullYear(now.getFullYear() + 1);
    const sisaHari = Math.floor((nextBday - now) / 86400000);

    let text = `🎂 *INFO ULANG TAHUN*\n\n`;
    text += `📅 Lahir: ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}\n`;
    text += `📆 Hari: ${['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'][lahir.getDay()]}\n\n`;
    text += `⏳ *Umur:*\n`;
    text += `• ${umurTahun} tahun, ${umurBulan} bulan, ${umurHari} hari\n`;
    text += `• ${totalBulan} bulan\n`;
    text += `• ${totalMinggu.toLocaleString('id-ID')} minggu\n`;
    text += `• ${totalHari.toLocaleString('id-ID')} hari\n\n`;
    text += `${zodiak.emoji} *Zodiak:* ${zodiak.nama}\n`;
    text += `🇮🇩 *Weton:* ${weton}\n\n`;
    text += `🎉 *Ultah berikutnya:* ${sisaHari} hari lagi!`;

    return sendMessage(from, text);
  },
};
