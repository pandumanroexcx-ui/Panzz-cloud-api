const { GROQ_KEY_TOOLS, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');

module.exports = {
  name: 'hitung',
  alias: ['calc', 'kalkulator', 'math'],
  category: 'tools',
  description: 'Hitung matematika kompleks (AI-powered)',

  async run({ from, args, sendMessage }) {
    if (!args?.[0]) {
      return sendMessage(from,
        '🧮 *KALKULATOR AI*\n\n' +
        '*Contoh:*\n' +
        '• `hitung 5 + 10 * 2`\n' +
        '• `hitung akar 144`\n' +
        '• `hitung 15% dari 200000`\n' +
        '• `hitung 2 pangkat 10`\n' +
        '• `hitung sin 30 derajat`\n' +
        '• `hitung 150000 / 12`'
      );
    }

    const question = args.join(' ');
    if (question.length > 200) return sendMessage(from, '❌ Max 200 karakter.');

    await sendMessage(from, '🧮 Lagi hitung...');

    try {
      const apiKey = GROQ_KEY_TOOLS || GROQ_API_KEY;
      const prompt = `Hitung: ${question}

Jawab dengan format:
Hasil: <angka hasil>
Cara: <langkah singkat 1-2 baris>

Kalau pertanyaan ambigu atau bukan matematika, jawab "Gak ngerti, coba lebih jelas."`;
      const result = await callGroq({ apiKey, prompt });

      // Coba ekstrak angka
      await sendMessage(from, `🧮 *HASIL*\n\n${result}`);
    } catch (e) {
      console.error('[HITUNG]', e.message);
      await sendMessage(from, '⚠️ Gagal hitung, coba lagi 🙏');
    }
  },
};
