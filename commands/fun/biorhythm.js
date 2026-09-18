function hitungBiorhythm(tglLahir) {
  const now = new Date();
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const tglLahirMs = new Date(tglLahir + 'T00:00:00Z').getTime();
  const nowMs = new Date(wib.toISOString().slice(0, 10) + 'T00:00:00Z').getTime();
  const hari = Math.floor((nowMs - tglLahirMs) / 86400000);

  return {
    hari,
    fisik: Math.sin((2 * Math.PI * hari) / 23) * 100,
    emosi: Math.sin((2 * Math.PI * hari) / 28) * 100,
    intelek: Math.sin((2 * Math.PI * hari) / 33) * 100,
  };
}

function bar(persen) {
  const abs = Math.abs(persen);
  const fill = Math.round((abs / 100) * 10);
  const sign = persen >= 0 ? '+' : '-';
  const emoji = persen >= 0 ? '🟢' : '🔴';
  return `${emoji} ${sign}${abs.toFixed(0).padStart(3)}% ${'█'.repeat(fill)}${'░'.repeat(10 - fill)}`;
}

module.exports = {
  name: 'biorhythm',
  alias: ['biori', 'biorythm'],
  category: 'fun',
  description: 'Biorhythm calculator',

  async run({ from, args, sendMessage }) {
    const tgl = (args?.[0] || '').match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (!tgl) {
      return sendMessage(from,
        '🧬 *BIORHYTHM*\n\n' +
        'Format: `biorhythm DD/MM/YYYY`\n\n' +
        '*Contoh:*\n' +
        '• `biorhythm 15/08/2000`\n' +
        '• `biorhythm 01-01-1995`\n\n' +
        '_Hitung siklus fisik, emosi, intelek hari ini_'
      );
    }

    const tglLahir = `${tgl[3]}-${tgl[2].padStart(2, '0')}-${tgl[1].padStart(2, '0')}`;
    if (isNaN(new Date(tglLahir + 'T00:00:00Z').getTime())) {
      return sendMessage(from, '❌ Tanggal gak valid.');
    }

    const r = hitungBiorhythm(tglLahir);

    // Saran
    let saran = '';
    if (r.fisik > 30) saran += '💪 Fisik lagi bagus, olahraga yuk!\n';
    else if (r.fisik < -30) saran += '😴 Fisik lagi drop, istirahat cukup.\n';
    if (r.emosi > 30) saran += '😊 Emosi positif, hari bagus!\n';
    else if (r.emosi < -30) saran += '😢 Emosi sensitif, hati-hati.\n';
    if (r.intelek > 30) saran += '🧠 Pikiran jernih, bagus buat belajar.\n';
    else if (r.intelek < -30) saran += '🤯 Pikiran agak kacau, santai aja.\n';

    await sendMessage(from,
      `🧬 *BIORHYTHM*\n\n` +
      `📅 Lahir: ${tgl[1]}/${tgl[2]}/${tgl[3]}\n` +
      `⏳ Umur: ${r.hari.toLocaleString('id-ID')} hari\n\n` +
      `🏃 *Fisik (23 hari):*\n${bar(r.fisik)}\n\n` +
      `❤️ *Emosi (28 hari):*\n${bar(r.emosi)}\n\n` +
      `🧠 *Intelek (33 hari):*\n${bar(r.intelek)}\n\n` +
      `💡 *Saran hari ini:*\n${saran || 'Semua normal, jalanin aja!'}`
    );
  },
};
