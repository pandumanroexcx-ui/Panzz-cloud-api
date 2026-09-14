const { GROQ_KEY_FUN, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');
const { setPending, getPending, clearPending } = require('../../lib/pending-downloads');

const TOPICS = ['umum', 'sejarah', 'sains', 'matematika', 'geografi', 'film', 'musik', 'teknologi'];

async function generateQuiz(topic) {
  const prompt = `Buat 1 soal pilihan ganda tentang ${topic} dalam bahasa Indonesia.
Balas HANYA JSON valid (tanpa teks lain):
{"question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"answer":"A","explanation":"..."}`;
  const apiKey = GROQ_KEY_FUN || GROQ_API_KEY;
  const text = await callGroq({ apiKey, prompt, responseJson: true });
  return JSON.parse(text.replace(/```json|```/g, '').trim());
}

module.exports = {
  name: 'kuis',
  alias: ['quiz'],
  category: 'fun',
  description: 'Kuis AI pilihan ganda',

  async run({ from, args, sendMessage, message }) {
    const key = `kuis:${from}`;
    if (args?.[0] === 'stop') {
      clearPending(key);
      await sendMessage(from, '🛑 Kuis dihentikan.');
      return;
    }

    const pending = getPending(key);
    if (pending) {
      const isReply = message?.context?.id === pending.messageId;
      const isCmd = message?.text?.body?.toLowerCase().startsWith('kuis');
      if (!isReply && !isCmd) return false;
      if (message?.context?.id && !isReply) return false;

      const jawab = (args?.[0] || '').toUpperCase().replace(/[^A-D]/g, '');
      if (!['A','B','C','D'].includes(jawab)) {
        await sendMessage(from, '❌ Jawab A, B, C, atau D.', { reply_to: pending.messageId });
        return;
      }
      clearPending(key);
      if (jawab === pending.answer) {
        await sendMessage(from, `🎉 *BENER!*\n\n💡 ${pending.explanation}\n\nMain lagi? *.kuis*`);
      } else {
        await sendMessage(from, `❌ *Salah!* Jawaban: *${pending.answer}*\n\n💡 ${pending.explanation}`);
      }
      return;
    }

    const topic = args?.[0] || TOPICS[Math.floor(Math.random()*TOPICS.length)];
    await sendMessage(from, '🧠 Lagi bikin soal...');
    try {
      const quiz = await generateQuiz(topic);
      const text = `🎯 *KUIS: ${topic.toUpperCase()}*\n\n${quiz.question}\n\n${quiz.options.join('\n')}\n\n📌 *Reply pesan ini* dengan A/B/C/D`;
      const sent = await sendMessage(from, text);
      setPending(key, { ...quiz, messageId: sent?.messages?.[0]?.id });
    } catch (e) {
      console.error('Kuis error:', e.message);
      await sendMessage(from, `❌ Gagal: ${e.message}`);
    }
  },
};
