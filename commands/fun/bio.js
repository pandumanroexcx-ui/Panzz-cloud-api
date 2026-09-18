const { GROQ_KEY_FUN, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');

module.exports = {
  name: 'bio',
  alias: ['biososmed', 'bioig'],
  category: 'fun',
  description: 'Bikin bio sosmed estetik',

  async run({ from, args, sendMessage }) {
    if (!args?.length) {
      return sendMessage(from,
        '💫 *BIO SOSMED*\n\n' +
        '*Format:* `bio <kepribadian/kata kunci>`\n\n' +
        '*Contoh:*\n' +
        '• `bio anak senja`\n' +
        '• `bio gamers introvert`\n' +
        '• `bio hijaber sederhana`\n' +
        '• `bio cowok mager`\n' +
        '• `bio cewek aesthetic`\n' +
        '• `bio mahasiswa sibuk`\n\n' +
        '_Bot kasih 5 pilihan bio siap pakai._'
      );
    }

    const topik = args.join(' ');
    await sendMessage(from, '💫 Lagi bikin bio...');

    try {
      const apiKey = GROQ_KEY_FUN || GROQ_API_KEY;
      const prompt = `Bikin 5 pilihan bio sosmed (IG/TikTok/Twitter) untuk: "${topik}"

Format:
1. [bio 1]
2. [bio 2]
...

Aturan:
- Boleh pake emoji, simbol estetik
- Max 2 baris per bio
- Estetik/kekinian/relatable
- Bahasa Indonesia atau mix English
- Jangan pakai penjelasan tambahan`;

      const result = await callGroq({ apiKey, prompt });
      await sendMessage(from, `💫 *5 BIO SOSMED*\n\n${result}`);
    } catch (e) {
      console.error('[BIO]', e.message);
      await sendMessage(from, '⚠️ Gagal, coba lagi 🙏');
    }
  },
};
