const { GROQ_KEY_TOOLS, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');

module.exports = {
  name: 'kalori',
  alias: ['calkalori', 'nutrisi'],
  category: 'ai',
  description: 'Hitung kalori makanan (AI)',

  async run({ from, args, sendMessage }) {
    if (!args?.length) {
      return sendMessage(from,
        '🍔 *KALKULATOR KALORI*\n\n' +
        '*Format:* `kalori <makanan> [porsi]`\n\n' +
        '*Contoh:*\n' +
        '• `kalori nasi goreng 1 piring`\n' +
        '• `kalori ayam bakar 200 gram`\n' +
        '• `kalori mie instan`\n' +
        '• `kalori 2 telur rebus`'
      );
    }

    const makanan = args.join(' ');
    await sendMessage(from, `🍔 Lagi ngitung kalori: _"${makanan}"_...`);

    try {
      const apiKey = GROQ_KEY_TOOLS || GROQ_API_KEY;
      const prompt = `Hitung kalori & nutrisi untuk: ${makanan}

Format:
🍔 *[Nama Makanan] ([Porsi])*

🔥 Kalori: [xxx] kkal
💪 Protein: [xx]g
🍚 Karbohidrat: [xx]g
🧈 Lemak: [xx]g
🌾 Serat: [xx]g

📊 *Estimasi:* [total kalori] kkal
💡 _[catatan sehat singkat]_

Aturan:
- Data realistis (masak Indonesia)
- Kalau gak ada porsi, asumsi 1 porsi standar
- Bahasa Indonesia santai`;

      const result = await callGroq({ apiKey, prompt });
      await sendMessage(from, result);
    } catch (e) {
      console.error('[KALORI]', e.message);
      await sendMessage(from, '⚠️ Gagal, coba lagi 🙏');
    }
  },
};
