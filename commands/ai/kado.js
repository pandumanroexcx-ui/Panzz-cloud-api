const { GROQ_KEY_TOOLS, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');

module.exports = {
  name: 'kado',
  alias: ['hadiah', 'gift', 'idehadiah'],
  category: 'ai',
  description: 'Ide kado untuk orang tersayang (AI)',

  async run({ from, args, sendMessage }) {
    if (!args?.length) {
      return sendMessage(from,
        '🎁 *IDE KADO*\n\n' +
        '*Format:* `kado <untuk_siapa> [budget] [occasion]`\n\n' +
        '*Contoh:*\n' +
        '• `kado pacar 500rb`\n' +
        '• `kado ibu ultah 200rb`\n' +
        '• `kado sahabat pernikahan 1jt`\n' +
        '• `kado anak 100rb`'
      );
    }

    const req = args.join(' ');
    await sendMessage(from, '🎁 Lagi mikir ide kado...');

    try {
      const apiKey = GROQ_KEY_TOOLS || GROQ_API_KEY;
      const prompt = `Kasih 5 ide kado untuk: ${req}

Format:
1. *[Nama Kado]* — [estimasi harga]
   💡 [alasan singkat 1 baris]
2. ...

Aturan:
- Realistis & bisa dibeli di Indonesia
- Variasi harga
- Sesuai budget kalau disebutkan
- Bahasa Indonesia santai
- Jangan pakai pembuka`;

      const result = await callGroq({ apiKey, prompt });
      await sendMessage(from, `🎁 *5 IDE KADO — ${req.toUpperCase()}*\n\n${result}`);
    } catch (e) {
      console.error('[KADO]', e.message);
      await sendMessage(from, '⚠️ Gagal, coba lagi 🙏');
    }
  },
};
