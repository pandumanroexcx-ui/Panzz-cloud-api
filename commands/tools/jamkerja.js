module.exports = {
  name: 'jamkerja',
  alias: ['workhours', 'durasi'],
  category: 'tools',
  description: 'Hitung durasi jam kerja',

  async run({ from, args, sendMessage }) {
    if (args?.length < 2) {
      return sendMessage(from,
        '⏰ *HITUNG JAM KERJA*\n\n' +
        '*Format:* `jamkerja <jam_masuk> <jam_keluar> [istirahat_menit]`\n\n' +
        '*Contoh:*\n' +
        '• `jamkerja 09:00 17:00`\n' +
        '• `jamkerja 08:30 17:30 60`\n' +
        '• `jamkerja 08:00 20:00 30`'
      );
    }

    const m1 = args[0].match(/^(\d{1,2}):(\d{2})$/);
    const m2 = args[1].match(/^(\d{1,2}):(\d{2})$/);
    if (!m1 || !m2) return sendMessage(from, '❌ Format jam: HH:MM (contoh: 09:00)');

    const istirahat = parseInt(args[2], 10) || 0;

    let masuk = parseInt(m1[1], 10) * 60 + parseInt(m1[2], 10);
    let keluar = parseInt(m2[1], 10) * 60 + parseInt(m2[2], 10);

    let lewatTengahMalam = false;
    if (keluar <= masuk) {
      keluar += 24 * 60;
      lewatTengahMalam = true;
    }

    const totalMenit = keluar - masuk;
    const kerjaMenit = totalMenit - istirahat;

    const totalJam = Math.floor(totalMenit / 60);
    const totalSisa = totalMenit % 60;
    const kerjaJam = Math.floor(kerjaMenit / 60);
    const kerjaSisa = kerjaMenit % 60;

    // Format decimal hours (untuk gaji)
    const kerjaDesimal = (kerjaMenit / 60).toFixed(2);

    let text = `⏰ *DURASI JAM KERJA*\n\n`;
    text += `🕐 Masuk: ${args[0]}\n`;
    text += `🕐 Keluar: ${args[1]}${lewatTengahMalam ? ' (besok)' : ''}\n`;
    if (istirahat) text += `☕ Istirahat: ${istirahat} menit\n`;
    text += `\n━━━━━━━━━━━━━━\n`;
    text += `⏱️ Total di tempat kerja: *${totalJam}j ${totalSisa}m*\n`;
    text += `💼 *Jam kerja bersih: ${kerjaJam}j ${kerjaSisa}m*\n`;
    text += `📊 Desimal: *${kerjaDesimal} jam*\n\n`;
    text += `_Buat hitung gaji: kalikan jam desimal × tarif/jam._`;

    await sendMessage(from, text);
  },
};
