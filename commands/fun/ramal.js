const { GROQ_KEY_FUN, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');

module.exports = {
  name: 'ramal',
  alias: ['ramalan', 'zodiac', 'horoscope'],
  category: 'fun',
  description: 'Ramalan lucu dari AI',

  async run({ from, args, sendMessage }) {
    const zodiac = args?.[0] || ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'][Math.floor(Math.random()*12)];
    await sendMessage(from, '🔮 Lagi ngramal...');
    try {
      const apiKey = GROQ_KEY_FUN || GROQ_API_KEY;
      const hasil = await callGroq({
        apiKey,
        prompt: `Buat ramalan hari ini yang lucu untuk zodiak ${zodiac} dalam bahasa Indonesia. Format:
🔮 *RAMALAN ${zodiac.toUpperCase()}*

💰 Rezeki: ...
❤️ Cinta: ...
💼 Karier: ...
🍀 Keberuntungan: ...
⚠️ Peringatan: ...`,
      });
      await sendMessage(from, hasil);
    } catch (e) {
      console.error('Ramal error:', e.message);
      await sendMessage(from, `❌ Gagal: ${e.message}`);
    }
  },
};
