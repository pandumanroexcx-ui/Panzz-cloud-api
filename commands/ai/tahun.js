const { GROQ_KEY_TOOLS, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');

module.exports = {
  name: 'tahun',
  alias: ['faktatahun', 'yearevent'],
  category: 'ai',
  description: 'Fakta & event tahun tertentu',

  async run({ from, args, sendMessage }) {
    const tahun = parseInt(args?.[0], 10);
    if (!tahun || tahun < 1900 || tahun > new Date().getFullYear()) {
      return sendMessage(from,
        '📅 *FAKTA TAHUN*\n\n' +
        '*Format:* `tahun <yyyy>`\n\n' +
        '*Contoh:*\n' +
        '• `tahun 1998`\n' +
        '• `tahun 2010`\n' +
        '• `tahun 1969`\n\n' +
        '_Range: 1900 - sekarang_'
      );
    }

    await sendMessage(from, `📅 Lagi nyari fakta tahun ${tahun}...`);

    try {
      const apiKey = GROQ_KEY_TOOLS || GROQ_API_KEY;
      const prompt = `Kasih fakta & event penting yang terjadi di tahun ${tahun}.

Format:
📅 *TAHUN ${tahun}*

🌍 *Event Dunia:*
• [event 1]
• [event 2]
• [event 3]

🇮🇩 *Event Indonesia:*
• [event 1]
• [event 2]

💡 *Fakta Menarik:*
[1-2 fakta unik tentang tahun ${tahun}]

🎵 *Lagu Populer:*
• [lagu 1]
• [lagu 2]

Bahasa Indonesia. Faktual. Kalau gak yakin, bilang "informasi terbatas".`;

      const result = await callGroq({ apiKey, prompt });
      await sendMessage(from, result);
    } catch (e) {
      console.error('[TAHUN]', e.message);
      await sendMessage(from, '⚠️ Gagal, coba lagi 🙏');
    }
  },
};
