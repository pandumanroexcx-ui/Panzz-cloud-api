const { GROQ_KEY_TOOLS, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');

module.exports = {
  name: 'minuman',
  alias: ['resepminuman', 'drink'],
  category: 'ai',
  description: 'Rekomendasi resep minuman (AI)',

  async run({ from, args, sendMessage }) {
    const req = args.join(' ').trim() || 'random';

    await sendMessage(from, `🥤 Lagi nyari resep minuman ${req}...`);

    try {
      const apiKey = GROQ_KEY_TOOLS || GROQ_API_KEY;
      const prompt = `Kasih 3 resep minuman ${req === 'random' ? '(variasi manis, segar, hangat)' : req}.

Format tiap resep:

🥤 *[Nama Minuman]*
⏱️ [Waktu buat] | 🍽️ [Porsi]
📝 Bahan:
• [bahan 1]
• [bahan 2]
👨‍🍳 Cara:
1. [langkah 1]
2. [langkah 2]

---

Aturan:
- Bahan mudah didapat di Indonesia
- Bahasa santai
- Singkat & jelas`;

      const result = await callGroq({ apiKey, prompt });
      await sendMessage(from, `🥤 *RESEP MINUMAN*\n\n${result}`);
    } catch (e) {
      console.error('[MINUMAN]', e.message);
      await sendMessage(from, '⚠️ Gagal, coba lagi 🙏');
    }
  },
};
