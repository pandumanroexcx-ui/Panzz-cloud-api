const { GROQ_KEY_FUN, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');

const GENRES = ['action', 'horor', 'komedi', 'romantis', 'thriller', 'sci-fi', 'drama', 'animasi'];

module.exports = {
  name: 'film',
  alias: ['movie', 'nonton', 'rekomendasifilm'],
  category: 'fun',
  description: 'Rekomendasi film dari genre',

  async run({ from, args, sendMessage }) {
    const genre = (args?.[0] || GENRES[Math.floor(Math.random() * GENRES.length)]).toLowerCase();

    await sendMessage(from, `🎬 Lagi nyari film ${genre}...`);

    try {
      const apiKey = GROQ_KEY_FUN || GROQ_API_KEY;
      const prompt = `Rekomendasi 5 film genre ${genre} (boleh barat/asia/indo).

Format:
1. *[Judul]* ([Tahun])
   ⭐ [Rating imdb kira-kira] | [Sinopsis singkat 1 baris]
2. *[Judul]* ([Tahun])
   ...

Aturan:
- Judul asli atau judul Indonesia
- Campur film populer & hidden gems
- Jangan pakai pembuka
- Bahasa Indonesia santai`;

      const result = await callGroq({ apiKey, prompt });
      await sendMessage(from, `🎬 *5 FILM ${genre.toUpperCase()}*\n\n${result}`);
    } catch (e) {
      console.error('[FILM]', e.message);
      await sendMessage(from, '⚠️ Gagal, coba lagi 🙏');
    }
  },
};
