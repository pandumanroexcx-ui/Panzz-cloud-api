const HARI = {
  'senin': { en: 'Monday', jp: '月曜日', ar: 'الإثنين', emoji: '🌙' },
  'selasa': { en: 'Tuesday', jp: '火曜日', ar: 'الثلاثاء', emoji: '🔥' },
  'rabu': { en: 'Wednesday', jp: '水曜日', ar: 'الأربعاء', emoji: '💧' },
  'kamis': { en: 'Thursday', jp: '木曜日', ar: 'الخميس', emoji: '🌳' },
  'jumat': { en: 'Friday', jp: '金曜日', ar: 'الجمعة', emoji: '⭐' },
  'sabtu': { en: 'Saturday', jp: '土曜日', ar: 'السبت', emoji: '🌍' },
  'minggu': { en: 'Sunday', jp: '日曜日', ar: 'الأحد', emoji: '☀️' },
};

module.exports = {
  name: 'hari',
  alias: ['namahari', 'day'],
  category: 'tools',
  description: 'Nama hari dalam berbagai bahasa',

  async run({ from, args, sendMessage }) {
    const input = (args?.[0] || '').toLowerCase();

    if (input && HARI[input]) {
      const h = HARI[input];
      return sendMessage(from,
        `${h.emoji} *${input.toUpperCase()}*\n\n` +
        `🇬🇧 English: ${h.en}\n` +
        `🇯🇵 Jepang: ${h.jp}\n` +
        `🇸🇦 Arab: ${h.ar}`
      );
    }

    // Default: hari ini
    const now = new Date();
    const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const hariIni = ['minggu','senin','selasa','rabu','kamis','jumat','sabtu'][wib.getUTCDay()];
    const h = HARI[hariIni];

    return sendMessage(from,
      `${h.emoji} *HARI INI: ${hariIni.toUpperCase()}*\n\n` +
      `🇬🇧 ${h.en}\n` +
      `🇯🇵 ${h.jp}\n` +
      `🇸🇦 ${h.ar}\n\n` +
      `_Coba: \`hari senin\` buat cek hari lain._`
    );
  },
};
