const { GROQ_KEY_TOOLS, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');

module.exports = {
  name: 'ide',
  alias: ['idea', 'idekonten'],
  category: 'ai',
  description: 'Ide konten untuk sosmed / project',

  async run({ from, args, sendMessage }) {
    if (!args?.length) {
      return sendMessage(from,
        '💡 *IDE KONTEN*\n\n' +
        '*Format:* `ide <niche/topik>`\n\n' +
        '*Contoh:*\n' +
        '• `ide konten masak`\n' +
        '• `ide video gaming`\n' +
        '• `ide konten edukasi`\n' +
        '• `ide project coding pemula`\n' +
        '• `ide bisnis online`'
      );
    }

    const topik = args.join(' ');
    await sendMessage(from, `💡 Lagi nyari ide: _"${topik}"_...`);

    try {
      const apiKey = GROQ_KEY_TOOLS || GROQ_API_KEY;
      const prompt = `Kasih 5 ide konten/project untuk topik: "${topik}"

Format:
1. *[Judul Ide]* — [penjelasan singkat 1 baris]
2. *[Judul Ide]* — [penjelasan]
...

Aturan:
- Ide fresh & practical
- Bisa langsung dieksekusi
- Bahasa Indonesia santai
- Jangan pakai penjelasan pembuka`;

      const result = await callGroq({ apiKey, prompt });
      await sendMessage(from, `💡 *5 IDE: ${topik.toUpperCase()}*\n\n${result}`);
    } catch (e) {
      console.error('[IDE]', e.message);
      await sendMessage(from, '⚠️ Gagal, coba lagi 🙏');
    }
  },
};
