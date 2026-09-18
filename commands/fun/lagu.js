const { GROQ_KEY_FUN, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');

const MOODS = ['galau', 'semangat', 'santai', 'sedih', 'bahagia', 'rindu', 'patah hati', 'belajar'];

module.exports = {
  name: 'lagu',
  alias: ['song', 'musik', 'rekomendasilagu'],
  category: 'fun',
  description: 'Rekomendasi lagu dari mood',

  async run({ from, args, sendMessage }) {
    const mood = args.join(' ').trim() || MOODS[Math.floor(Math.random() * MOODS.length)];

    await sendMessage(from, `🎵 Lagi nyari lagu ${mood}...`);

    try {
      const apiKey = GROQ_KEY_FUN || GROQ_API_KEY;
      const prompt = `Rekomendasi 7 lagu untuk mood "${mood}" (boleh indo & barat).

Format:
1. *[Judul]* — [Artis]
2. *[Judul]* — [Artis]
...

Aturan:
- Campur lagu populer & hidden gems
- Judul asli
- Jangan pakai pembuka atau penjelasan tambahan
- Kalau mood spesifik, pilih lagu yang sesuai`;

      const result = await callGroq({ apiKey, prompt });
      await sendMessage(from, `🎵 *7 LAGU MOOD: ${mood.toUpperCase()}*\n\n${result}\n\n_Ketik \`lagu <judul>\` buat download MP3-nya!_`);
    } catch (e) {
      console.error('[LAGU]', e.message);
      await sendMessage(from, '⚠️ Gagal, coba lagi 🙏');
    }
  },
};
