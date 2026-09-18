const { GROQ_KEY_TOOLS, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');

const KATEGORI = ['umum', 'sains', 'hewan', 'sejarah', 'teknologi', 'luar angkasa', 'tubuh manusia', 'psikologi'];

module.exports = {
  name: 'fakta',
  alias: ['faktaunik', 'funfact', 'fact'],
  category: 'ai',
  description: 'Fakta menarik random',

  async run({ from, args, sendMessage }) {
    const kat = args.join(' ').trim() || KATEGORI[Math.floor(Math.random() * KATEGORI.length)];
    await sendMessage(from, '🔍 Lagi nyari fakta menarik...');

    try {
      const apiKey = GROQ_KEY_TOOLS || GROQ_API_KEY;
      const prompt = `Kasih 1 fakta menarik tentang ${kat} dalam bahasa Indonesia.

Format:
💡 *[Judul Fakta]*

[Penjelasan 2-3 baris, fakta beneran & mengejutkan]

_Tau gak sih?_

Aturan:
- Fakta harus valid (bukan hoax)
- Menarik & bikin takjub
- Bahasa Indonesia santai`;

      const result = await callGroq({ apiKey, prompt });
      await sendMessage(from, result);
    } catch (e) {
      console.error('[FAKTA]', e.message);
      await sendMessage(from, '⚠️ Gagal, coba lagi 🙏');
    }
  },
};
