const { GROQ_KEY_FUN, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');

const GENRES = ['romantis', 'sedih', 'rindu', 'bahagia', 'galau', 'kehidupan', 'sahabat', 'alam'];

module.exports = {
  name: 'puisi',
  alias: ['poem', 'sajak'],
  category: 'fun',
  description: 'Bikin puisi dari AI',

  async run({ from, args, sendMessage }) {
    const genre = (args[0] || GENRES[Math.floor(Math.random() * GENRES.length)]).toLowerCase();
    const tema = args.slice(1).join(' ').trim();

    await sendMessage(from, `✍️ Lagi nulis puisi ${genre}...`);

    try {
      const apiKey = GROQ_KEY_FUN || GROQ_API_KEY;
      const prompt = `Tulis puisi bahasa Indonesia genre ${genre}${tema ? ` dengan tema "${tema}"` : ''}.

Aturan:
- 3-4 bait (bebas)
- Puitis, penuh makna, menyentuh hati
- Boleh pake rima atau bebas
- Jangan terlalu panjang
- Jangan pakai judul, langsung puisi
- Jangan pakai penjelasan tambahan`;

      const result = await callGroq({ apiKey, prompt });
      await sendMessage(from, `✍️ *PUISI ${genre.toUpperCase()}*${tema ? ` — ${tema}` : ''}\n\n${result}`);
    } catch (e) {
      console.error('[PUISI]', e.message);
      await sendMessage(from, '⚠️ Gagal bikin puisi, coba lagi 🙏');
    }
  },
};
