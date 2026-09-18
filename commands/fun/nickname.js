const { GROQ_KEY_FUN, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');

module.exports = {
  name: 'nick',
  alias: ['nickname', 'namaestetik'],
  category: 'fun',
  description: 'Generator nickname estetik/kekinian',

  async run({ from, args, sendMessage }) {
    if (!args?.length) {
      return sendMessage(from,
        '✨ *NICKNAME GENERATOR*\n\n' +
        '*Format:* `nick <nama> [style]`\n\n' +
        '*Contoh:*\n' +
        '• `nick Panzz`\n' +
        '• `nick Andi aesthetic`\n' +
        '• `nick Sarah jepang`\n' +
        '• `nick Budi keren`\n' +
        '• `nick Rina islami`\n\n' +
        '*Style:* aesthetic, keren, lucu, jepang, islami, gamer'
      );
    }

    const nama = args[0];
    const style = args.slice(1).join(' ') || 'aesthetic';

    await sendMessage(from, `✨ Lagi bikin nickname...`);

    try {
      const apiKey = GROQ_KEY_FUN || GROQ_API_KEY;
      const prompt = `Bikin 8 nickname untuk nama "${nama}" dengan style "${style}".

Format:
1. [nickname] — [alasan/arti singkat]
2. ...

Aturan:
- Boleh pake simbol, emoji, karakter unik
- Estetik dan kekinian
- Jangan pakai penjelasan pembuka
- Bahasa Indonesia santai`;

      const result = await callGroq({ apiKey, prompt });
      await sendMessage(from, `✨ *8 NICKNAME UNTUK ${nama.toUpperCase()}*\n\n${result}`);
    } catch (e) {
      console.error('[NICK]', e.message);
      await sendMessage(from, '⚠️ Gagal, coba lagi 🙏');
    }
  },
};
