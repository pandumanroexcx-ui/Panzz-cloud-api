const { GROQ_KEY_TOOLS, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');

module.exports = {
  name: 'resep',
  alias: ['masak', 'resepmasakan'],
  category: 'tools',
  description: 'Resep masakan dari bahan yang ada',

  async run({ from, args, sendMessage }) {
    if (!args?.length) {
      return sendMessage(from,
        '🍳 *RESEP MASAKAN*\n\n' +
        '*Format:* `resep <bahan1> <bahan2> ...`\n\n' +
        '*Contoh:*\n' +
        '• `resep telur bawang`\n' +
        '• `resep ayam kecap`\n' +
        '• `resep nasi goreng`\n' +
        '• `resep mie instan telur`\n\n' +
        '_Bot kasih 2-3 resep yang bisa dibuat dari bahan itu._'
      );
    }

    const bahan = args.join(' ');
    await sendMessage(from, `🍳 Lagi nyari resep: _"${bahan}"_...`);

    try {
      const apiKey = GROQ_KEY_TOOLS || GROQ_API_KEY;
      const prompt = `User punya bahan: ${bahan}

Kasih 2-3 resep masakan Indonesia yang bisa dibuat dari bahan itu (boleh nambah bahan dasar lain yang umum).

Format tiap resep:
🍳 *Nama Resep*
⏱️ Waktu: xx menit | 🍽️ Porsi: x
📝 Bahan:
• bahan 1
• bahan 2
👨‍🍳 Cara:
1. langkah 1
2. langkah 2

Pisah antar resep dengan ---

Bahasa santai, singkat, jelas.`;

      const result = await callGroq({ apiKey, prompt });
      await sendMessage(from, `🍳 *RESEP DARI: ${bahan.toUpperCase()}*\n\n${result}`);
    } catch (e) {
      console.error('[RESEP]', e.message);
      await sendMessage(from, '⚠️ Gagal cari resep, coba lagi 🙏');
    }
  },
};
