const { GEMINI_API_KEY } = require('../config');
const { markdownToWhatsApp } = require('./format-whatsapp');

async function callGemini(parts) {
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
      body: JSON.stringify({ contents: [{ parts }] }),
    }
  );

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!answer) throw new Error('Ga dapet jawaban dari AI');

  return markdownToWhatsApp(answer);
}

async function askGemini(question) {
  return callGemini([{ text: question }]);
}

async function askGeminiWithImage(question, imageBuffer, mimeType) {
  const base64Image = imageBuffer.toString('base64');
  return callGemini([
    { text: question || 'Jelasin apa isi gambar ini' },
    { inline_data: { mime_type: mimeType, data: base64Image } },
  ]);
}

module.exports = { askGemini, askGeminiWithImage };
