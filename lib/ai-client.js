const { GEMINI_KEY_CHAT, GEMINI_API_KEY } = require('../config');
const { markdownToWhatsApp } = require('./format-whatsapp');
const { getHistory, addMessage } = require('./ai-memory');

const MODELS = ['gemini-2.0-flash', 'gemini-2.5-flash-lite', 'gemini-1.5-flash'];

const SYSTEM_PROMPT = 'Kamu adalah asisten WhatsApp yang ramah. Selalu jawab pakai Bahasa Indonesia santai kecuali user minta bahasa lain. Jawaban singkat, jelas, gak bertele-tele.';

function parseKeys(input) {
  if (!input) return [];
  return String(input).split(',').map(k => k.trim()).filter(Boolean);
}

function getAllKeys() {
  const keys = [];
  if (GEMINI_KEY_CHAT) keys.push(...parseKeys(GEMINI_KEY_CHAT));
  if (GEMINI_API_KEY) keys.push(...parseKeys(GEMINI_API_KEY));
  return [...new Set(keys)];
}

async function callGeminiMultiKey({ prompt, responseJson, timeoutMs = 30000 }) {
  const keys = getAllKeys();
  if (keys.length === 0) throw new Error('GEMINI key kosong');

  let lastError = null;

  for (const key of keys) {
    for (const model of MODELS) {
      try {
        const body = { contents: [{ parts: [{ text: prompt }] }] };
        if (responseJson) body.generationConfig = { responseMimeType: 'application/json' };

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(timeoutMs),
          }
        );

        const data = await res.json();
        if (data.error) {
          const msg = data.error.message || '';
          console.log(`[GEMINI] ${model} + key ...${key.slice(-6)}: ${msg.slice(0, 80)}`);
          lastError = new Error(msg);
          continue;
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          lastError = new Error('No text in response');
          continue;
        }

        console.log(`[GEMINI] OK via ${model} (key ...${key.slice(-6)})`);
        return text.trim();
      } catch (e) {
        lastError = e;
      }
    }
  }

  throw lastError || new Error('Semua Gemini key + model gagal');
}

function buildPrompt(history, userMessage) {
  let prompt = `[SYSTEM]\n${SYSTEM_PROMPT}\n\n`;
  for (const h of history) {
    prompt += `[${h.role === 'user' ? 'USER' : 'BOT'}]\n${h.content}\n\n`;
  }
  prompt += `[USER]\n${userMessage}\n\n[BOT]`;
  return prompt;
}

async function askGemini(userId, question) {
  const history = getHistory(userId);
  const prompt = buildPrompt(history, question);
  const answer = await callGeminiMultiKey({ prompt });
  const formatted = markdownToWhatsApp(answer);
  addMessage(userId, 'user', question);
  addMessage(userId, 'model', formatted);
  return formatted;
}

async function askGeminiWithImage(userId, question, imageBuffer, mimeType) {
  const keys = getAllKeys();
  if (keys.length === 0) throw new Error('GEMINI key kosong');
  const base64 = imageBuffer.toString('base64');

  for (const key of keys) {
    for (const model of MODELS) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: question || 'Jelasin apa isi gambar ini' },
                  { inline_data: { mime_type: mimeType, data: base64 } },
                ],
              }],
            }),
          }
        );
        const data = await res.json();
        if (data.error) {
          console.log(`[GEMINI-VISION] ${model}: ${data.error.message.slice(0, 80)}`);
          continue;
        }
        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!answer) continue;

        const formatted = markdownToWhatsApp(answer);
        addMessage(userId, 'user', `[Gambar] ${question || ''}`);
        addMessage(userId, 'model', formatted);
        return formatted;
      } catch (e) {
        continue;
      }
    }
  }
  throw new Error('Semua Gemini key + model gagal');
}

module.exports = { askGemini, askGeminiWithImage, callGeminiMultiKey };
