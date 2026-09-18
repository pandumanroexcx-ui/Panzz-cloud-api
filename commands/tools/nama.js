const { GROQ_KEY_TOOLS, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');

module.exports = {
  name: 'nama',
  alias: ['namabayi', 'babyname'],
  category: 'tools',
  description: 'Saran nama bayi',

  async run({ from, args, sendMessage }) {
    if (!args?.length) {
      return sendMessage(from,
        '👶 *Saran Nama Bayi*\n\n' +
        '*Format:* `nama <gender> <nuansa/asal>`\n\n' +
        '*Contoh:*\n' +
        '• `nama laki islami`\n' +
        '• `nama perempuan modern`\n' +
        '• `nama laki jawa kuno`\n' +
        '• `nama perempuan sansekerta`\n' +
        '• `nama laki barat modern`\n\n' +
        '*Gender:* laki / perempuan / netral'
      );
    }

    const jenis = args.join(' ');
    await sendMessage(from, `👶 Lagi nyari nama: _"${jenis}"_...`);

    try {
      const apiKey = GROQ_KEY_TOOLS || GROQ_API_KEY;
      const prompt = `Kasih 10 saran nama bayi untuk: "${jenis}"

Format:
1. *[Nama Lengkap]* — arti: [arti singkat]
2. ...

Aturan:
- 10 nama
- Ada arti/makna
- Campur nama pendek & panjang
- Bahasa Indonesia santai
- Jangan pakai pembuka`;

      const result = await callGroq({ apiKey, prompt });
      await sendMessage(from, `👶 *10 NAMA: ${jenis.toUpperCase()}*\n\n${result}`);
    } catch (e) {
      console.error('[NAMA]', e.message);
      await sendMessage(from, '⚠️ Gagal, coba lagi 🙏');
    }
  },
};
