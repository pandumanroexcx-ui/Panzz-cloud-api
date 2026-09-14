const { GROQ_KEY_FUN, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');

module.exports = {
  name: 'wyr',
  alias: ['wouldyourather', 'pilihmana'],
  category: 'fun',
  description: 'Pertanyaan Would You Rather',

  async run({ from, sendMessage }) {
    await sendMessage(from, '🤔 Lagi mikir...');
    try {
      const apiKey = GROQ_KEY_FUN || GROQ_API_KEY;
      const hasil = await callGroq({
        apiKey,
        prompt: 'Buat 1 pertanyaan "Would You Rather" dalam bahasa Indonesia yang absurd & lucu. Format:\n🤔 *WOULD YOU RATHER*\n\nPilih salah satu:\n\n*A.* [opsi 1]\n*B.* [opsi 2]',
      });
      await sendMessage(from, hasil);
    } catch (e) {
      console.error('WYR error:', e.message);
      await sendMessage(from, `❌ Gagal: ${e.message}`);
    }
  },
};
