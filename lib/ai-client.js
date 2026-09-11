const { GEMINI_API_KEY } = require('../config');

async function askGemini(question) {
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
        contents: [{ parts: [{ text: question }] }],
      }),
    }
  );

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!answer) throw new Error('Ga dapet jawaban dari AI');

  return answer;
}

module.exports = { askGemini };
