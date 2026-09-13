const { GEMINI_API_KEY } = require('../../config');

async function generateRamalan(zodiac) {
  const prompt = `Buat ramalan hari ini yang lucu & menghibur untuk zodiak ${zodiac} dalam bahasa Indonesia. Format:
🔮 *RAMALAN ${zodiac.toUpperCase()}*

💰 Rezeki: ...
❤️ Cinta: ...
💼 Karier: ...
🍀 Keberuntungan: ...
⚠️ Peringatan: ...

Bikin singkat, lucu, jangan serius. Max 1 baris per bagian.`;
  const res = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.candidates?.[0]?.content?.parts?.[0]?.text;
}

module.exports = {
  name: 'ramal',
  alias: ['ramalan', 'zodiac', 'horoscope'],
  category: 'fun',
  description: 'Ramalan lucu dari AI',

  async run({ from, args, sendMessage }) {
    const zodiac = args?.[0] || ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][Math.floor(Math.random() * 12)];
    await sendMessage(from, '🔮 Lagi ngramal...');
    try {
      const hasil = await generateRamalan(zodiac);
      await sendMessage(from, hasil);
    } catch (e) {
      console.error('Ramal error:', e.message);
      await sendMessage(from, `❌ Gagal: ${e.message}`);
    }
  },
};
