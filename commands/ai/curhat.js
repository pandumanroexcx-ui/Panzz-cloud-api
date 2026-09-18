const { GROQ_KEY_TOOLS, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');

module.exports = {
  name: 'curhat',
  alias: ['cerita', 'sharing'],
  category: 'ai',
  description: 'Teman curhat empatik (anonim)',

  async run({ from, args, sendMessage }) {
    if (!args?.length) {
      return sendMessage(from,
        '🤗 *TEMAN CURHAT*\n\n' +
        'Ketik curhat kamu apa aja — bot bakal dengerin tanpa nge-judge.\n\n' +
        '*Contoh:*\n' +
        '• `curhat aku lagi capek kerjaan`\n' +
        '• `curhat aku galau sama dia`\n' +
        '• `curhat aku ngerasa sendirian`\n' +
        '• `curhat aku gagal ujian`\n\n' +
        '_Bot bakal kasih respon empatik, saran, atau cuma dengerin._'
      );
    }

    const isi = args.join(' ');
    if (isi.length > 2000) return sendMessage(from, '❌ Max 2000 karakter.');

    await sendMessage(from, '🤗 Lagi dengerin...');

    try {
      const apiKey = GROQ_KEY_TOOLS || GROQ_API_KEY;
      const prompt = `Kamu adalah teman curhat yang empatik, hangat, dan pengertian.

User curhat: "${isi}"

Cara merespon:
1. Validasi perasaannya dulu (1-2 kalimat) — jangan langsung kasih solusi
2. Kasih perspektif atau refleksi yang lembut
3. Kalau butuh, tawarin saran praktis (max 2-3 saran)
4. Akhiri dengan kalimat hangat/penyemangat

Aturan:
- Bahasa Indonesia santai, kayak ngobrol sama teman
- Gak menghakimi, gak nge-judge
- Gak pake bahasa robot
- Max 5-6 baris
- Kalau curhatnya tentang self-harm/depresi berat, sarankan cari bantuan profesional`;

      const result = await callGroq({ apiKey, prompt });
      await sendMessage(from, `🤗 *Respon:*\n\n${result}`);
    } catch (e) {
      console.error('[CURHAT]', e.message);
      await sendMessage(from, '⚠️ Gagal, coba lagi 🙏');
    }
  },
};
