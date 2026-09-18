const { GROQ_KEY_TOOLS, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');

module.exports = {
  name: 'coding',
  alias: ['code', 'programmer'],
  category: 'ai',
  description: 'Asisten coding (debug, explain, dll)',

  async run({ from, args, sendMessage }) {
    if (!args?.length) {
      return sendMessage(from,
        '💻 *ASISTEN CODING*\n\n' +
        '*Format:* `coding <pertanyaan/kode>`\n\n' +
        '*Contoh:*\n' +
        '• `coding cara bikin array di JS`\n' +
        '• `coding kenapa kode ini error: for(i=0;i<10;i++)`\n' +
        '• `coding bikin fungsi python buat cek prima`\n' +
        '• `coding jelasin async await`\n\n' +
        '_Bot bantu debug, jelasin, atau bikin kode._'
      );
    }

    const query = args.join(' ');
    if (query.length > 1500) return sendMessage(from, '❌ Max 1500 karakter.');

    await sendMessage(from, '💻 Lagi mikir...');

    try {
      const apiKey = GROQ_KEY_TOOLS || GROQ_API_KEY;
      const prompt = `Kamu adalah programmer senior berpengalaman. User nanya:

${query}

Jawab dalam bahasa Indonesia santai. Aturan:
- Kalau minta kode, kasih kode pake code block (\`\`\`)
- Kalau debug, jelasin penyebab error + solusinya
- Kalau jelasin konsep, kasih analogi sederhana + contoh
- Singkat, jelas, gak bertele-tele
- Max 15 baris jawaban (kecuali kode)`;

      const result = await callGroq({ apiKey, prompt });
      await sendMessage(from, `💻 *ASISTEN CODING*\n\n${result}`);
    } catch (e) {
      console.error('[CODING]', e.message);
      await sendMessage(from, '⚠️ Gagal, coba lagi 🙏');
    }
  },
};
