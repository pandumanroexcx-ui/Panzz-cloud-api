module.exports = {
  name: 'waktu',
  alias: ['now', 'sekarang'],
  category: 'tools',
  description: 'Info waktu lengkap',

  async run({ from, sendMessage }) {
    const now = new Date();
    const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const hari = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'][wib.getUTCDay()];
    const bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'][wib.getUTCMonth()];
    const jam = String(wib.getUTCHours()).padStart(2, '0');
    const menit = String(wib.getUTCMinutes()).padStart(2, '0');
    const detik = String(wib.getUTCSeconds()).padStart(2, '0');
    const tgl = wib.getUTCDate();
    const tahun = wib.getUTCFullYear();

    let greeting = '🌙 Selamat malam';
    const h = wib.getUTCHours();
    if (h >= 5 && h < 11) greeting = '🌅 Selamat pagi';
    else if (h >= 11 && h < 15) greeting = '☀️ Selamat siang';
    else if (h >= 15 && h < 18) greeting = '🌇 Selamat sore';

    // Week number
    const startOfYear = new Date(Date.UTC(tahun, 0, 1));
    const weekNum = Math.ceil(((wib - startOfYear) / 86400000 + startOfYear.getUTCDay() + 1) / 7);

    await sendMessage(from,
      `🕐 *WAKTU SEKARANG*\n\n` +
      `${greeting}!\n\n` +
      `📅 *${hari}, ${tgl} ${bulan} ${tahun}*\n` +
      `🕐 *${jam}:${menit}:${detik} WIB*\n` +
      `📆 Minggu ke-${weekNum}\n` +
      `🌏 Timezone: Asia/Jakarta (UTC+7)`
    );
  },
};
