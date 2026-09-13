const { GEMINI_API_KEY } = require('../../config');

const LANG_MAP = {
  en: 'Inggris', id: 'Indonesia', jp: 'Jepang', jv: 'Jawa',
  su: 'Sunda', ar: 'Arab', kr: 'Korea', cn: 'Mandarin',
  es: 'Spanyol', fr: 'Prancis', de: 'Jerman', ru: 'Rusia',
};

async function translateText(text, targetLang) {
  const langName = LANG_MAP[targetLang.toLowerCase()] || targetLang;
  const prompt = `Terjemahkan teks berikut ke bahasa ${langName}. Jawab HANYA terjemahannya, tanpa penjelasan:\n\n${text}`;

  const res = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!answer) throw new Error('Ga dapet hasil translate');
  return answer.trim();
}

module.exports = {
  name: 'tr',
  alias: ['translate', 'terjemah'],
  category: 'tools',
  description: 'Translate teks ke bahasa lain',

  async run({ from, args, sendMessage, message }) {
    if (!args || args.length < 2) {
      await sendMessage(from,
        '📝 *Format:* tr <kode_bahasa> <teks>\n\n' +
        '*Contoh:*\n' +
        'tr en Aku cinta kamu\n' +
        'tr jp Selamat pagi\n\n' +
        '*Kode bahasa:* en, id, jp, jv, su, ar, kr, cn, es, fr, de, ru'
      );
      return;
    }

    const lang = args[0];
    const text = args.slice(1).join(' ');

    if (text.length > 1000) {
      await sendMessage(from, '❌ Teks kepanjangan (max 1000 karakter).');
      return;
    }

    await sendMessage(from, '🌐 Lagi diterjemahin...');
    try {
      const result = await translateText(text, lang);
      const langName = LANG_MAP[lang.toLowerCase()] || lang;
      await sendMessage(from, `🌐 *${langName}:*\n\n${result}`);
    } catch (e) {
      console.error('Translate error:', e.message);
      await sendMessage(from, `❌ Gagal translate: ${e.message}`);
    }
  },
};
