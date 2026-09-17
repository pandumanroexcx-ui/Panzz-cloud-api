const { GROQ_KEY_FUN, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');

module.exports = {
  name: 'pantun',
  alias: ['pantunin'],
  category: 'fun',
  description: 'Bikin pantun dari tema',

  async run({ from, args, sendMessage }) {
    const tema = args.join(' ').trim() || 'random';

    await sendMessage(from, '🎭 Lagi bikin pantun...');

    try {
      const apiKey = GROQ_KEY_FUN || GROQ_API_KEY;
      const prompt = `Bikin 1 pantun bahasa Indonesia dengan tema "${tema}".

Aturan:
- 4 baris (sampiran 2 baris, isi 2 baris)
- Rima a-b-a-b
- Lucu, menghibur, atau bermakna
- Bahasa santai
- Jangan pakai penjelasan tambahan

Format:
[Baris 1]
[Baris 2]
[Baris 3]
[Baris 4]`;

      const result = await callGroq({ apiKey, prompt });
      await sendMessage(from, `🎭 *PANTUN ${tema.toUpperCase()}*\n\n${result}`);
    } catch (e) {
      console.error('[PANTUN]', e.message);
      await sendMessage(from, '⚠️ Gagal bikin pantun, coba lagi 🙏');
    }
  },
};
