const { GEMINI_API_KEY } = require('../../config');

async function generateJoke() {
  const prompt = 'Buat 1 jokes receh bahasa Indonesia. Singkat (max 2 kalimat). Boleh garing, yang penting lucu. Jangan pakai pembuka "Kenapa" mulu.';
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
  name: 'jokes',
  alias: ['joke', 'lucu', 'garing'],
  category: 'fun',
  description: 'Jokes receh dari AI',

  async run({ from, sendMessage }) {
    await sendMessage(from, '😂 Lagi nyari jokes...');
    try {
      const joke = await generateJoke();
      await sendMessage(from, `😂 *JOKES*\n\n${joke}`);
    } catch (e) {
      console.error('Jokes error:', e.message);
      await sendMessage(from, `❌ Gagal: ${e.message}`);
    }
  },
};
