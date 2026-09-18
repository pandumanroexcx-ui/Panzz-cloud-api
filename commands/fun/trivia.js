const { GROQ_KEY_FUN, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');
const { setPending, getPending, clearPending } = require('../../lib/pending-downloads');

async function generateTrivia() {
  const prompt = `Bikin 1 pertanyaan trivia bahasa Indonesia yang menarik.

Format JSON valid (JANGAN tambah teks lain):
{"question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"answer":"A","explanation":"..."}`;

  const apiKey = GROQ_KEY_FUN || GROQ_API_KEY;
  const text = await callGroq({ apiKey, prompt, responseJson: true });
  return JSON.parse(text.replace(/```json|```/g, '').trim());
}

module.exports = {
  name: 'trivia',
  alias: ['triv'],
  category: 'fun',
  description: 'Pertanyaan trivia random',

  async run({ from, args, sendMessage, message }) {
    const key = `trivia:${from}`;

    if (args?.[0] === 'stop') {
      clearPending(key);
      return sendMessage(from, '🛑 Trivia dihentikan.');
    }

    const pending = getPending(key);
    if (pending) {
      const jawab = (args?.[0] || '').toUpperCase().replace(/[^A-D]/g, '');
      if (!['A','B','C','D'].includes(jawab)) {
        return sendMessage(from, '❌ Jawab dengan A, B, C, atau D.');
      }
      clearPending(key);
      if (jawab === pending.answer) {
        return sendMessage(from, `🎉 *BENER!*\n\n💡 ${pending.explanation}\n\nMain lagi? \`trivia\``);
      }
      return sendMessage(from, `❌ *Salah!* Jawaban: *${pending.answer}*\n\n💡 ${pending.explanation}`);
    }

    await sendMessage(from, '🎲 Lagi bikin pertanyaan...');
    try {
      const t = await generateTrivia();
      setPending(key, t);
      const text = `🎲 *TRIVIA*\n\n${t.question}\n\n${t.options.join('\n')}\n\nJawab: A / B / C / D`;
      await sendMessage(from, text);
    } catch (e) {
      console.error('[TRIVIA]', e.message);
      await sendMessage(from, '⚠️ Gagal bikin trivia, coba lagi 🙏');
    }
  },
};
