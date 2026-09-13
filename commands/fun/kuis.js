const { GEMINI_API_KEY } = require('../../config');
const { setPending, getPending, clearPending } = require('../../lib/pending-downloads');

const TOPICS = ['umum', 'sejarah', 'sains', 'matematika', 'geografi', 'film', 'musik', 'teknologi'];

async function generateQuiz(topic) {
  const prompt = `Buat 1 soal pilihan ganda tentang ${topic} dalam bahasa Indonesia.
Format JSON valid (JANGAN tambah teks lain, JANGAN pakai code block):
{"question": "...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "answer": "A", "explanation": "..."}

Aturan:
- Pertanyaan jelas & menantang
- 4 opsi jawaban
- answer salah satu dari A/B/C/D
- explanation singkat kenapa jawabannya itu`;

  const res = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    }
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  text = text.replace(/```json|```/g, '').trim();
  return JSON.parse(text);
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
      const isReplyToGame = message?.context?.id === pending.messageId;
      const isCommand = message?.text?.body?.toLowerCase().startsWith('kuis');

      if (!isReplyToGame && !isCommand) return false;
      if (message?.context?.id && !isReplyToGame) return false;

      const jawab = (args?.[0] || '').toUpperCase().replace(/[^A-D]/g, '');
      if (!['A', 'B', 'C', 'D'].includes(jawab)) {
        await sendMessage(from, '❌ Jawab dengan A, B, C, atau D.\nContoh: *A*', { reply_to: pending.messageId });
        return;
      }

      clearPending(key);
      if (jawab === pending.answer) {
        await sendMessage(from, `🎉 *BENER!*\n\n💡 ${pending.explanation}\n\nMain lagi? Ketik *.kuis*`);
      } else {
        await sendMessage(from, `❌ *Salah!* Jawaban: *${pending.answer}*\n\n💡 ${pending.explanation}\n\nMain lagi? Ketik *.kuis*`);
      }
      return;
    }

    const topic = args?.[0] || TOPICS[Math.floor(Math.random() * TOPICS.length)];
    await sendMessage(from, '🧠 Lagi bikin soal...');
    try {
      const quiz = await generateQuiz(topic);
      const text =
        `🎯 *KUIS: ${topic.toUpperCase()}*\n\n` +
        `${quiz.question}\n\n` +
        quiz.options.join('\n') + '\n\n' +
        `📌 *Balas/reply pesan ini* dengan *A* / *B* / *C* / *D*\n` +
        `Atau ketik *.kuis stop* buat berhenti.`;

      const sent = await sendMessage(from, text);
      const sentId = sent?.messages?.[0]?.id;

      setPending(key, { ...quiz, messageId: sentId });
    } catch (e) {
      console.error('Kuis error:', e.message);
      await sendMessage(from, `❌ Gagal bikin soal: ${e.message}`);
    }
  },
};
