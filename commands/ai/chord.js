const { GROQ_KEY_TOOLS, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');

module.exports = {
  name: 'chord',
  alias: ['kunci', 'gitarchord'],
  category: 'ai',
  description: 'Cari chord gitar lagu (AI)',

  async run({ from, args, sendMessage }) {
    if (!args?.length) {
      return sendMessage(from,
        '🎸 *CHORD GITAR*\n\n' +
        '*Format:* `chord <judul lagu> - <penyanyi>`\n\n' +
        '*Contoh:*\n' +
        '• `chord Mawar Merah - Slank`\n' +
        '• `chord Bintang di Surga - Peterpan`\n' +
        '• `chord Akad - Payung Teduh`'
      );
    }

    const lagu = args.join(' ');
    await sendMessage(from, `🎸 Lagi nyari chord: _"${lagu}"_...`);

    try {
      const apiKey = GROQ_KEY_TOOLS || GROQ_API_KEY;
      const prompt = `Kasih chord gitar untuk lagu: ${lagu}

Format:
🎸 *${lagu}*

🎼 *Nada Dasar:* [C/G/D/dll]
🎸 *Capo:* [kalau ada]

*Intro:* [chord]

*Verse:*
[chord per baris]

*Chorus:*
[chord per baris]

*Lirik + Chord:*
[potongan chorus dengan chord di atas lirik]

Aturan:
- Chord gitar standar (bukan piano)
- Kalau ada capo, kasih info
- Bahasa Indonesia santai
- Kalau lagu gak ada/gak tau, bilang aja`;

      const result = await callGroq({ apiKey, prompt });
      await sendMessage(from, result);
    } catch (e) {
      console.error('[CHORD]', e.message);
      await sendMessage(from, '⚠️ Gagal, coba lagi 🙏');
    }
  },
};
