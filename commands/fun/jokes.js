const { GROQ_KEY_FUN, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');

module.exports = {
  name: 'jokes',
  alias: ['joke', 'lucu', 'garing'],
  category: 'fun',
  description: 'Jokes receh dari AI',

  async run({ from, sendMessage }) {
    await sendMessage(from, '😂 Lagi nyari jokes...');
    try {
      const apiKey = GROQ_KEY_FUN || GROQ_API_KEY;
      const joke = await callGroq({
        apiKey,
        prompt: 'Buat 1 jokes receh bahasa Indonesia. Singkat (max 2 kalimat). Boleh garing yang penting lucu.',
      });
      await sendMessage(from, `😂 *JOKES*\n\n${joke}`);
    } catch (e) {
      console.error('Jokes error:', e.message);
      await sendMessage(from, `❌ Gagal: ${e.message}`);
    }
  },
};
