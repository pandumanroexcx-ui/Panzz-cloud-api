const { GROQ_KEY_TOOLS, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');

module.exports = {
  name: 'faktauang',
  alias: ['uangfakta', 'moneyfact'],
  category: 'ai',
  description: 'Fakta tentang uang (AI)',

  async run({ from, args, sendMessage }) {
    const topik = args.join(' ').trim() || 'random';
    await sendMessage(from, '💵 Lagi nyari fakta uang...');

    try {
      const apiKey = GROQ_KEY_TOOLS || GROQ_API_KEY;
      const prompt = `Kasih 1 fakta menarik tentang uang${topik !== 'random' ? ` topik: ${topik}` : ''}.

Format:
💵 *[Judul Fakta]*

[Penjelasan 2-3 baris]

💡 _Tau gak sih?_

Aturan:
- Fakta beneran (bukan hoax)
- Menarik & bikin takjub
- Bahasa Indonesia santai
- Bisa tentang uang dunia, sejarah, psikologi uang, dll`;

      const result = await callGroq({ apiKey, prompt });
      await sendMessage(from, result);
    } catch (e) {
      console.error('[FAKTATAHUN]', e.message);
      await sendMessage(from, '⚠️ Gagal, coba lagi 🙏');
    }
  },
};
