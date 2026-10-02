const { GROQ_KEY_TOOLS, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');
const { getMemory } = require('../../lib/memory');

const TOPIK = [
  'apa arti kebahagiaan buat kamu?',
  'kalo boleh balik ke masa lalu, momen apa yang mau kamu ulang?',
  'apa hal yang paling kamu takutin?',
  'menurutmu, apa tujuan hidup kamu?',
  'siapa orang yang paling berpengaruh dalam hidupmu?',
  'apa mimpi yang belum tercapai sampai sekarang?',
  'hal apa yang paling kamu syukuri hari ini?',
  'kalo kamu punya 1 hari lagi hidup, mau ngapain?',
  'apa yang bikin kamu bangun pagi-pagi semangat?',
  'menurutmu, apa bedanya cinta sama suka?',
  'apa kenangan masa kecil yang paling kamu inget?',
  'kalo bisa ganti 1 hal dari diri kamu, apa?',
  'apa hal yang paling kamu sesali?',
  'gimana perasaan kamu belakangan ini?',
];

module.exports = {
  name: 'deeptalk',
  alias: ['ngobroldalam', 'deep'],
  category: 'tools',
  description: 'Ajakin bot ngobrol mendalam',

  async run({ from, args, sendMessage }) {
    const pertanyaan = args.join(' ').trim() || TOPIK[Math.floor(Math.random() * TOPIK.length)];

    const memory = getMemory(from);
    const nama = memory.nama || 'Kamu';

    await sendMessage(from, '💭 Lagi mikir...');

    try {
      const apiKey = GROQ_KEY_TOOLS || GROQ_API_KEY;
      const prompt = `Kamu adalah teman ngobrol yang empatik dan suka ngobrol mendalam.

${nama ? `Nama user: ${nama}` : ''}
${Object.keys(memory).length ? `Info user: ${Object.entries(memory).map(([k,v]) => `${k}=${v}`).join(', ')}` : ''}

Topik deep talk: "${pertanyaan}"

Tugasmu:
1. Jangan langsung jawab pertanyaan
2. Balikin pertanyaan ke user, kasih 1-2 pertanyaan lanjutan yang bikin dia mikir
3. Kasih 1 opini singkat kamu buat pancing obrolan
4. Nada santai, empatik, kayak teman curhat

Aturan:
- Max 4-5 baris
- Bahasa Indonesia santai
- Jangan sok tau, jangan ceramah
- Emoji secukupnya`;

      const result = await callGroq({ apiKey, prompt });
      await sendMessage(from, `💭 *DEEP TALK*\n\n${result}`);
    } catch (e) {
      console.error('[DEEP]', e.message);
      await sendMessage(from, '⚠️ Gagal, coba lagi 🙏');
    }
  },
};
