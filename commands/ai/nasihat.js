const { GROQ_KEY_TOOLS, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');

module.exports = {
  name: 'nasihat',
  alias: ['saran', 'advice'],
  category: 'ai',
  description: 'Nasihat hidup dari AI',

  async run({ from, args, sendMessage }) {
    if (!args?.length) {
      return sendMessage(from,
        '💡 *NASIHAT HIDUP*\n\n' +
        '*Format:* `nasihat <masalah/topik>`\n\n' +
        '*Contoh:*\n' +
        '• `nasihat cara ngatasin malas`\n' +
        '• `nasihat biar gak overthinking`\n' +
        '• `nasihat cara hemat duit`\n' +
        '• `nasihat biar produktif`\n' +
        '• `nasihat cara move on`'
      );
    }

    const topik = args.join(' ');
    await sendMessage(from, '💡 Lagi mikir nasihat...');

    try {
      const apiKey = GROQ_KEY_TOOLS || GROQ_API_KEY;
      const prompt = `Kasih nasihat praktis untuk: "${topik}"

Format:
💡 *NASIHAT*

📌 *Langkah praktis:*
1. [langkah 1]
2. [langkah 2]
3. [langkah 3]

⭐ *Kunci sukses:* [1 kalimat utama]

Aturan:
- Bahasa Indonesia santai
- Practical & actionable
- Gak judgemental
- Max 5-7 baris`;

      const result = await callGroq({ apiKey, prompt });
      await sendMessage(from, result);
    } catch (e) {
      console.error('[NASIHAT]', e.message);
      await sendMessage(from, '⚠️ Gagal, coba lagi 🙏');
    }
  },
};
