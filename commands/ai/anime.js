const { GROQ_KEY_TOOLS, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');

module.exports = {
  name: 'anime',
  alias: ['rekomendasianime', 'weeb'],
  category: 'ai',
  description: 'Rekomendasi anime dari genre',

  async run({ from, args, sendMessage }) {
    const genre = args.join(' ').trim() || 'random';

    await sendMessage(from, `🎌 Lagi nyari anime ${genre}...`);

    try {
      const apiKey = GROQ_KEY_TOOLS || GROQ_API_KEY;
      const prompt = `Rekomendasi 5 anime ${genre === 'random' ? 'dari berbagai genre' : `genre ${genre}`}.

Format:
1. *[Judul]* — [Tahun]
   📺 [Jumlah episode] | 🎬 [Studio]
   📝 [Sinopsis singkat 1 baris]

Aturan:
- Anime beneran ada (bukan fiktif)
- Campur yang populer & hidden gems
- Bahasa Indonesia santai
- Jangan pakai pembuka`;

      const result = await callGroq({ apiKey, prompt });
      await sendMessage(from, `🎌 *5 ANIME ${genre.toUpperCase()}*\n\n${result}`);
    } catch (e) {
      console.error('[ANIME]', e.message);
      await sendMessage(from, '⚠️ Gagal, coba lagi 🙏');
    }
  },
};
