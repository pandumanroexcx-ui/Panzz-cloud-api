const { GROQ_KEY_FUN, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');

module.exports = {
  name: 'dadjoke',
  alias: ['jokebapak', 'jokegaring'],
  category: 'fun',
  description: 'Jokes garing ala bapak-bapak',

  async run({ from, sendMessage }) {
    await sendMessage(from, '👨 Lagi nyari jokes bapack...');
    try {
      const apiKey = GROQ_KEY_FUN || GROQ_API_KEY;
      const prompt = `Bikin 1 jokes garing ala bapak-bapak Indonesia.

Ciri khas:
- Pertanyaan + jawaban receh
- Terkadang pake plesetan kata
- Bikin orang ngerutuk "garing" tapi tetap ketawa

Contoh style:
"Kenapa lampu mati? Karena gak bayar listrik. 😂"

Jawab singkat max 3 baris.`;
      const result = await callGroq({ apiKey, prompt });
      await sendMessage(from, `👨 *JOKES BAPACK*\n\n${result}`);
    } catch (e) {
      await sendMessage(from, '⚠️ Gagal, coba lagi 🙏');
    }
  },
};
