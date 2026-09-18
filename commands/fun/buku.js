const { GROQ_KEY_FUN, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');

module.exports = {
  name: 'buku',
  alias: ['book', 'bacaan', 'rekomendasibuku'],
  category: 'fun',
  description: 'Rekomendasi buku dari topik',

  async run({ from, args, sendMessage }) {
    if (!args?.length) {
      return sendMessage(from,
        '📚 *REKOMENDASI BUKU*\n\n' +
        '*Format:* `buku <topik>`\n\n' +
        '*Contoh:*\n' +
        '• `buku self improvement`\n' +
        '• `buku bisnis`\n' +
        '• `buku fiksi`\n' +
        '• `buku psikologi`\n' +
        '• `buku programming`\n' +
        '• `buku sejarah`'
      );
    }

    const topik = args.join(' ');
    await sendMessage(from, `📚 Lagi nyari buku: _"${topik}"_...`);

    try {
      const apiKey = GROQ_KEY_FUN || GROQ_API_KEY;
      const prompt = `Rekomendasi 5 buku tentang "${topik}" (boleh indo/barat).

Format:
1. *[Judul]* — [Penulis]
   📖 [Sinopsis singkat 1 baris]
2. ...

Aturan:
- Buku beneran ada (bukan fiktif)
- Campur buku klasik & kontemporer
- Bahasa Indonesia santai
- Jangan pakai pembuka`;

      const result = await callGroq({ apiKey, prompt });
      await sendMessage(from, `📚 *5 BUKU: ${topik.toUpperCase()}*\n\n${result}`);
    } catch (e) {
      console.error('[BUKU]', e.message);
      await sendMessage(from, '⚠️ Gagal, coba lagi 🙏');
    }
  },
};
