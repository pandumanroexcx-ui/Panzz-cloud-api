const { GROQ_KEY_TOOLS, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');

const BAHASA = ['jawa', 'sunda', 'batak', 'minang', 'bugis', 'madura', 'bali', 'banjar', 'aceh', 'papua'];

module.exports = {
  name: 'daerah',
  alias: ['bahasadaerah', 'translate-daerah'],
  category: 'ai',
  description: 'Terjemah bahasa daerah Indonesia (AI)',

  async run({ from, args, sendMessage }) {
    if (args?.length < 2) {
      return sendMessage(from,
        '🇮🇩 *BAHASA DAERAH*\n\n' +
        '*Format:* `daerah <bahasa> <teks>`\n\n' +
        '*Contoh:*\n' +
        '• `daerah jawa aku cinta kamu`\n' +
        '• `daerah sunda selamat pagi`\n' +
        '• `daerah batak terima kasih`\n' +
        '• `daerah minang apa kabar`\n\n' +
        '*Bahasa:* ' + BAHASA.join(', ')
      );
    }

    const bahasa = args[0].toLowerCase();
    const teks = args.slice(1).join(' ');

    if (teks.length > 300) return sendMessage(from, '❌ Max 300 karakter.');

    await sendMessage(from, `🇮🇩 Lagi terjemahin ke bahasa ${bahasa}...`);

    try {
      const apiKey = GROQ_KEY_TOOLS || GROQ_API_KEY;
      const prompt = `Terjemahkan ke bahasa daerah Indonesia: "${teks}" ke bahasa ${bahasa}.

Format:
🇮🇩 *BAHASA ${bahasa.toUpperCase()}*

📝 Asli: ${teks}
🗣️ Terjemahan: [hasil]
🔤 Cara baca: [cara baca kira-kira]

💡 *Info singkat:*
[1-2 kalimat tentang bahasa ${bahasa}]

Kalau bahasa gak valid atau gak tau, bilang aja.`;

      const result = await callGroq({ apiKey, prompt });
      await sendMessage(from, result);
    } catch (e) {
      console.error('[DAERAH]', e.message);
      await sendMessage(from, '⚠️ Gagal, coba lagi 🙏');
    }
  },
};
