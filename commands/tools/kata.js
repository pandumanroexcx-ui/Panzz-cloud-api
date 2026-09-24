const { GROQ_KEY_TOOLS, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');

module.exports = {
  name: 'kata',
  alias: ['sinonim', 'antonim', 'tesaurus'],
  category: 'tools',
  description: 'Cari sinonim/antonim kata',

  async run({ from, args, sendMessage }) {
    if (!args?.length) {
      return sendMessage(from,
        '📖 *SINONIM & ANTONIM*\n\n' +
        '*Format:* `kata <kata>`\n\n' +
        '*Contoh:*\n' +
        '• `kata pintar`\n' +
        '• `kata bahagia`\n' +
        '• `kata sedih`'
      );
    }

    const word = args[0];
    if (word.length > 50) return sendMessage(from, '❌ Max 50 karakter.');

    await sendMessage(from, `📖 Lagi nyari kata *${word}*...`);

    try {
      const apiKey = GROQ_KEY_TOOLS || GROQ_API_KEY;
      const prompt = `Kasih info tentang kata: "${word}"

Format:
📖 *KATA: ${word.toUpperCase()}*

📚 *Sinonim (persamaan):*
[8-10 sinonim, pisah koma]

🔄 *Antonim (lawan kata):*
[8-10 antonim, pisah koma]

💡 *Arti singkat:*
[1-2 kalimat]

📝 *Contoh kalimat:*
• [contoh 1]
• [contoh 2]

Bahasa Indonesia. Kalau kata gak ada, bilang "kata gak ditemukan".`;

      const result = await callGroq({ apiKey, prompt });
      await sendMessage(from, result);
    } catch (e) {
      console.error('[KATA]', e.message);
      await sendMessage(from, '⚠️ Gagal, coba lagi 🙏');
    }
  },
};
