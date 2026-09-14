const { GROQ_KEY_FUN, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');

const GENRES = ['horor','romantis','komedi','petualangan','misteri','fantasi','sci-fi','drama'];

module.exports = {
  name: 'cerita',
  alias: ['story', 'dongeng'],
  category: 'fun',
  description: 'Cerita pendek dari AI',

  async run({ from, args, sendMessage }) {
    const genre = (args?.[0] || GENRES[Math.floor(Math.random()*GENRES.length)]).toLowerCase();
    const tema = args?.slice(1).join(' ') || '';
    await sendMessage(from, `📖 Lagi nulis cerita ${genre}...`);
    try {
      const apiKey = GROQ_KEY_FUN || GROQ_API_KEY;
      const story = await callGroq({
        apiKey,
        prompt: `Tulis cerita pendek genre ${genre}${tema ? ` dengan tema "${tema}"` : ''} dalam bahasa Indonesia. 150-300 kata. Ada pembuka, konflik, penutup. Gaya santai.`,
      });
      await sendMessage(from, `📖 *CERITA ${genre.toUpperCase()}*\n\n${story}`);
    } catch (e) {
      console.error('Cerita error:', e.message);
      await sendMessage(from, `❌ Gagal: ${e.message}`);
    }
  },
};
