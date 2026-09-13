const { GEMINI_API_KEY } = require('../config');
const { markdownToWhatsApp } = require('./format-whatsapp');
const { getHistory, addMessage } = require('./ai-memory');

const SYSTEM_PROMPT = 'Kamu adalah asisten WhatsApp yang ramah. Selalu jawab pakai Bahasa Indonesia santai kecuali user minta bahasa lain. Jawaban singkat, jelas, gak bertele-tele.';

async function callGemini(contents) {
  if (!GEMINI_API_KEY) {
    throw new Error('API key Gemini belum di-set');
  }

  const res = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
      }),
    }
  );

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!answer) throw new Error('Ga dapet jawaban dari AI');

  return markdownToWhatsApp(answer);
}

async function askGemini(userId, question) {
  const history = getHistory(userId);

  // Format history ke Gemini contents
  const contents = [
    ...history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }],
    })),
    { role: 'user', parts: [{ text: question }] },
  ];

  const answer = await callGemini(contents);

  // Simpen ke history
  addMessage(userId, 'user', question);
  addMessage(userId, 'model', answer);

  return answer;
}

async function askGeminiWithImage(userId, question, imageBuffer, mimeType) {
  const base64Image = imageBuffer.toString('base64');
  const history = getHistory(userId);
  const promptText = question || 'Jelasin apa isi gambar ini';

  const contents = [
    ...history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }],
    })),
    {
      role: 'user',
      parts: [
        { text: promptText },
        { inline_data: { mime_type: mimeType, data: base64Image } },
      ],
    },
  ];

  const answer = await callGemini(contents);

  addMessage(userId, 'user', `[Gambar] ${promptText}`);
  addMessage(userId, 'model', answer);

  return answer;
}

module.exports = { askGemini, askGeminiWithImage };
