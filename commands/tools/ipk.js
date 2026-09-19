// Mapping nilai huruf ke bobot
const BOBOT = {
  'A': 4.0, 'A-': 3.7, 'AB': 3.5, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'BC': 2.5, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'CD': 1.5, 'D': 1.0, 'E': 0,
};

module.exports = {
  name: 'ipk',
  alias: ['gpa', 'nilai'],
  category: 'tools',
  description: 'Hitung IPK dari nilai semester',

  async run({ from, args, sendMessage }) {
    if (!args?.length) {
      return sendMessage(from,
        '📚 *KALKULATOR IPK*\n\n' +
        '*Format:* `ipk <sks:nilai> <sks:nilai> ...`\n\n' +
        '*Contoh:*\n' +
        '• `ipk 3:A 2:B+ 4:A- 3:C`\n' +
        '  → 3 SKS nilai A, 2 SKS B+, dst\n\n' +
        '*Nilai:* A, A-, AB, B+, B, B-, BC, C+, C, C-, CD, D, E'
      );
    }

    const items = args.join(' ').split(/\s+/).filter(Boolean);
    const valid = [];
    const invalid = [];

    for (const item of items) {
      const m = item.match(/^(\d+):([A-Ea-e][+-]?|[AB][+-]?|BC|CD)$/i);
      if (!m) { invalid.push(item); continue; }
      const sks = parseInt(m[1], 10);
      const nilai = m[2].toUpperCase();
      if (BOBOT[nilai] === undefined) { invalid.push(item); continue; }
      valid.push({ sks, nilai, bobot: BOBOT[nilai] });
    }

    if (!valid.length) {
      return sendMessage(from, `❌ Gak ada format yang valid.\n\nFormat: \`ipk 3:A 2:B\`\n\nInvalid: ${invalid.join(', ')}`);
    }

    const totalSks = valid.reduce((s, v) => s + v.sks, 0);
    const totalPoin = valid.reduce((s, v) => s + v.sks * v.bobot, 0);
    const ipk = totalPoin / totalSks;

    // Predikat
    let predikat, emoji;
    if (ipk >= 3.5) { predikat = 'Cum Laude 🏆'; emoji = '🥇'; }
    else if (ipk >= 3.0) { predikat = 'Sangat Memuaskan'; emoji = '🥈'; }
    else if (ipk >= 2.5) { predikat = 'Memuaskan'; emoji = '🥉'; }
    else if (ipk >= 2.0) { predikat = 'Cukup'; emoji = '📖'; }
    else { predikat = 'Perlu Perbaikan'; emoji = '⚠️'; }

    let text = `📚 *KALKULASI IPK*\n\n`;
    text += `*Detail:*\n`;
    for (const v of valid) {
      text += `• ${v.sks} SKS × ${v.nilai} (${v.bobot}) = ${(v.sks * v.bobot).toFixed(1)} poin\n`;
    }
    text += `\n━━━━━━━━━━━━━━\n`;
    text += `📊 Total SKS: *${totalSks}*\n`;
    text += `💯 Total Poin: *${totalPoin.toFixed(2)}*\n`;
    text += `\n${emoji} *IPK: ${ipk.toFixed(2)}*\n`;
    text += `🏅 Predikat: ${predikat}`;

    if (invalid.length) text += `\n\n⚠️ Skip: ${invalid.join(', ')}`;

    await sendMessage(from, text);
  },
};
