const { GROQ_KEY_TOOLS, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');

module.exports = {
  name: 'kopi',
  alias: ['resepkopi', 'coffee'],
  category: 'ai',
  description: 'Resep kopi (AI)',

  async run({ from, args, sendMessage }) {
    const tipe = args.join(' ').trim() || 'random';

    await sendMessage(from, `☕ Lagi nyari resep kopi ${tipe}...`);

    try {
      const apiKey = GROQ_KEY_TOOLS || GROQ_API_KEY;
      const prompt = `Kasih 3 resep kopi ${tipe === 'random' ? '(variasi panas, dingin, unik)' : tipe}.

Format tiap resep:

☕ *[Nama Kopi]*
⏱️ [Waktu] | 🍽️ [Porsi]
📝 Bahan:
• [bahan 1]
• [bahan 2]
👨‍🍳 Cara:
1. [langkah 1]
2. [langkah 2]

---

Aturan:
- Bahan mudah didapat
- Bahasa santai
- Bisa dibuat di rumah (tanpa mesin espresso)`;

      const result = await callGroq({ apiKey, prompt });
      await sendMessage(from, `☕ *RESEP KOPI*\n\n${result}`);
    } catch (e) {
      console.error('[KOPI]', e.message);
      await sendMessage(from, '⚠️ Gagal, coba lagi 🙏');
    }
  },
};
