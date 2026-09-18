const { GROQ_KEY_TOOLS, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');

module.exports = {
  name: 'caption',
  alias: ['cap', 'captionig'],
  category: 'ai',
  description: 'Bikin caption sosmed (IG, TikTok, dll)',

  async run({ from, args, sendMessage }) {
    if (!args?.length) {
      return sendMessage(from,
        '📸 *CAPTION GENERATOR*\n\n' +
        '*Format:* `caption <deskripsi foto/momen>`\n\n' +
        '*Contoh:*\n' +
        '• `caption foto sunset di pantai`\n' +
        '• `caption lagi ngopi santai`\n' +
        '• `caption liburan ke bali sama teman`\n' +
        '• `caption selfie di cafe aesthetic`\n\n' +
        '_Bot kasih 3 pilihan caption + hashtag._'
      );
    }

    const desc = args.join(' ');
    await sendMessage(from, '📸 Lagi bikin caption...');

    try {
      const apiKey = GROQ_KEY_TOOLS || GROQ_API_KEY;
      const prompt = `Bikin 3 caption Instagram/TikTok bahasa Indonesia untuk: "${desc}"

Format:
1️⃣ [caption 1 - singkat & catchy]
2️⃣ [caption 2 - aesthetic puitis]
3️⃣ [caption 3 - lucu/relatable]

📌 *Hashtag:*
#tag1 #tag2 #tag3 ... (10 hashtag relevan)

Aturan:
- Caption max 2 baris
- Bahasa santai, kekinian
- Boleh pake emoji
- Jangan pakai penjelasan tambahan`;

      const result = await callGroq({ apiKey, prompt });
      await sendMessage(from, `📸 *CAPTION UNTUK:* ${desc}\n\n${result}`);
    } catch (e) {
      console.error('[CAPTION]', e.message);
      await sendMessage(from, '⚠️ Gagal, coba lagi 🙏');
    }
  },
};
