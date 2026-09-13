const { GEMINI_API_KEY } = require('../../config');

async function generateWYR() {
  const prompt = 'Buat 1 pertanyaan "Would You Rather" (Pilih mana) dalam bahasa Indonesia yang absurd & lucu. Format:
🤔 *WOULD YOU RATHER*

Pilih salah satu:

*A.* [opsi 1]
*B.* [opsi 2]

Jangan pakai penjelasan tambahan.';
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
  return data.candidates?.[0]?.content?.parts?.[0]?.text;
}

module.exports = {
  name: 'wyr',
  alias: ['wouldyourather', 'pilihmana'],
  category: 'fun',
  description: 'Pertanyaan Would You Rather',

  async run({ from, sendMessage }) {
    await sendMessage(from, '🤔 Lagi mikir...');
    try {
      const hasil = await generateWYR();
      await sendMessage(from, hasil);
    } catch (e) {
      console.error('WYR error:', e.message);
      await sendMessage(from, `❌ Gagal: ${e.message}`);
    }
  },
};
