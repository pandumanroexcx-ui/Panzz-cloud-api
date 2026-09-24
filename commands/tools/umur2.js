module.exports = {
  name: 'umur2',
  alias: ['selisihumur', 'bedaumur'],
  category: 'tools',
  description: 'Hitung selisih umur 2 orang',

  async run({ from, args, sendMessage }) {
    if (args?.length < 2) {
      return sendMessage(from,
        '🎂 *SELISIH UMUR*\n\n' +
        '*Format:* `umur2 <tgl1> | <tgl2>`\n\n' +
        '*Contoh:*\n' +
        '• `umur2 15/08/2000 | 20/05/2003`\n' +
        '• `umur2 01/01/1995 | 01/01/2000`\n\n' +
        '_Format: DD/MM/YYYY_'
      );
    }

    const raw = args.join(' ');
    if (!raw.includes('|')) return sendMessage(from, '❌ Pake `|` antara 2 tanggal. Contoh: `umur2 15/08/2000 | 20/05/2003`');

    const parts = raw.split('|').map(s => s.trim());
    const parse = (str) => {
      const m = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
      if (!m) return null;
      const d = new Date(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10));
      return isNaN(d.getTime()) ? null : d;
    };

    const t1 = parse(parts[0]);
    const t2 = parse(parts[1]);
    if (!t1 || !t2) return sendMessage(from, '❌ Format tanggal gak valid. Pake DD/MM/YYYY.');

    const diffMs = Math.abs(t2 - t1);
    const diffHari = Math.floor(diffMs / 86400000);
    const diffJam = Math.floor(diffMs / 3600000);
    const diffMenit = Math.floor(diffMs / 60000);

    // Hitung tahun/bulan/hari
    const older = t1 < t2 ? t1 : t2;
    const newer = t1 < t2 ? t2 : t1;
    let tahun = newer.getFullYear() - older.getFullYear();
    let bulan = newer.getMonth() - older.getMonth();
    let hari = newer.getDate() - older.getDate();
    if (hari < 0) { bulan--; hari += 30; }
    if (bulan < 0) { tahun--; bulan += 12; }

    await sendMessage(from,
      `🎂 *SELISIH UMUR*\n\n` +
      `📅 Tanggal 1: ${parts[0]}\n` +
      `📅 Tanggal 2: ${parts[1]}\n\n` +
      `━━━━━━━━━━━━━━\n` +
      `⏳ *Selisih:*\n` +
      `• ${tahun} tahun, ${bulan} bulan, ${hari} hari\n` +
      `• ${diffHari.toLocaleString('id-ID')} hari\n` +
      `• ${diffJam.toLocaleString('id-ID')} jam\n` +
      `• ${diffMenit.toLocaleString('id-ID')} menit\n\n` +
      `_Yang lebih tua: ${t1 < t2 ? 'Tanggal 1' : 'Tanggal 2'}_`
    );
  },
};
