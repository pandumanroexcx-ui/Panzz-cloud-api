const { GEMINI_KEY_CHAT, GEMINI_API_KEY } = require('../config');
const { markdownToWhatsApp } = require('./format-whatsapp');
const { getHistory, addMessage } = require('./ai-memory');
const { getPersona } = require('./persona-store');
const { getMemory } = require('./memory');

const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.5-flash-lite'];

// Persona default: teman ngobrol
const DEFAULT_PERSONA = `Kamu adalah teman ngobrol yang asik, santai, dan pengertian. Bukan asisten, bukan robot.

Gaya ngobrol:
- Pakai bahasa santai kayak teman sebaya (gue-lo, atau aku-kamu, pilih yang natural)
- Jawab singkat, gak bertele-tele
- Suka nanya balik, penasaran sama cerita user
- Boleh bercanda, receh, atau serius sesuai situasi
- Gak judgemental, gak sok tau
- Kalau user lagi sedih, validasi perasaannya dulu
- Kalau user lagi seneng, ikut seneng
- Jangan pakai format kaku kayak "Berikut adalah..." atau "Ada yang bisa saya bantu?"
- Kadang pakai emoji, tapi jangan berlebihan

ATURAN PENTING:
- Kalau user cerita hal personal (nama, hobi, umur, ultah, pekerjaan, dll), INGAT dan simpen.
- Format simpen memori: [REMEMBER: key = value] di akhir jawaban (jangan keliatan di output ke user).`;

function parseKeys(input) {
  if (!input) return [];
  return String(input).split(',').map(k => k.trim()).filter(Boolean);
}

function getGeminiKeys() {
  const keys = [];
  if (GEMINI_KEY_CHAT) keys.push(...parseKeys(GEMINI_KEY_CHAT));
  if (GEMINI_API_KEY) keys.push(...parseKeys(GEMINI_API_KEY));
  return [...new Set(keys)];
}

async function tryGemini({ prompt, timeoutMs = 30000 }) {
  const keys = getGeminiKeys();
  let lastError = null;

  for (const key of keys) {
    for (const model of GEMINI_MODELS) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
            signal: AbortSignal.timeout(timeoutMs),
          }
        );
        const data = await res.json();
        if (data.error) { lastError = new Error(data.error.message); continue; }
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) continue;
        console.log(`[AI] OK via Gemini ${model}`);
        return text.trim();
      } catch (e) { lastError = e; }
    }
  }
  throw lastError || new Error('Semua Gemini gagal');
}

async function tryGroq({ prompt }) {
  const { callGroq } = require('./groq');
  const text = await callGroq({ prompt });
  console.log('[AI] OK via Groq fallback');
  return text;
}

async function callAI({ prompt }) {
  try {
    return await tryGemini({ prompt });
  } catch (e) {
    console.log('[AI] Gemini gagal, coba Groq...', e.message.slice(0, 80));
  }
  return await tryGroq({ prompt });
}

function buildPrompt(userId, userMessage) {
  const persona = getPersona(userId);
  const history = getHistory(userId);
  const memory = getMemory(userId);

  // Persona user atau default (teman)
  const personaText = persona.key === 'default' || !persona.key
    ? DEFAULT_PERSONA
    : persona.prompt;

  let prompt = `[SYSTEM]\n${personaText}\n\n`;

  // Inject memori user (kalau ada)
  const memoryKeys = Object.keys(memory);
  if (memoryKeys.length) {
    prompt += `[INFO TENTANG USER yang kamu inget:]\n`;
    for (const k of memoryKeys) prompt += `- ${k}: ${memory[k]}\n`;
    prompt += `\nGunakan info ini buat ngobrol, jangan tanya lagi. Contohnya: kalau udah tau nama user, panggil pakai nama.\n\n`;
  }

  // History
  for (const h of history) {
    prompt += `[${h.role === 'user' ? 'USER' : 'KAMU'}]\n${h.content}\n\n`;
  }

  prompt += `[USER]\n${userMessage}\n\n[KAMU]`;
  return prompt;
}

// Parse memory dari output AI
function extractMemory(text) {
  const memories = [];
  // Support: [REMEMBER: key = value] atau (REMEMBER: key=value)
  const regex = /[\[\(]REMEMBER:\s*([^=\]]+?)\s*=\s*([^\]\)]+?)[\]\)]/gi;
  let match;
  while ((match = regex.exec(text)) !== null) {
    memories.push({ key: match[1].trim(), value: match[2].trim() });
  }
  // Hapus tag dari output
  const cleaned = text.replace(/[\[\(]REMEMBER:[^\]]+[\]\)]/gi, '').trim();
  return { cleaned, memories };
}

async function askGemini(userId, question) {
  const prompt = buildPrompt(userId, question);
  const rawAnswer = await callAI({ prompt });

  // Extract & simpen memory
  const { cleaned, memories } = extractMemory(rawAnswer);
  if (memories.length) {
    const { setMemory } = require('./memory');
    for (const m of memories) {
      setMemory(userId, m.key, m.value);
      console.log(`[MEMORY] ${userId} → ${m.key} = ${m.value}`);
    }
  }

  const formatted = markdownToWhatsApp(cleaned);
  addMessage(userId, 'user', question);
  addMessage(userId, 'model', formatted);
  return formatted;
}

async function askGeminiWithImage(userId, question, imageBuffer, mimeType) {
  const keys = getGeminiKeys();
  if (keys.length === 0) throw new Error('GEMINI key kosong');
  const base64 = imageBuffer.toString('base64');
  const persona = getPersona(userId);
  const personaText = persona.key === 'default' || !persona.key ? DEFAULT_PERSONA : persona.prompt;
  const memory = getMemory(userId);

  let fullPrompt = personaText;
  if (Object.keys(memory).length) {
    fullPrompt += `\n\n[INFO USER:] ` + Object.entries(memory).map(([k, v]) => `${k}=${v}`).join(', ');
  }
  fullPrompt += `\n\n${question || 'Jelasin apa isi gambar ini'}`;

  for (const key of keys) {
    for (const model of GEMINI_MODELS) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: fullPrompt },
                  { inline_data: { mime_type: mimeType, data: base64 } },
                ],
              }],
            }),
          }
        );
        const data = await res.json();
        if (data.error) continue;
        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!answer) continue;

        const { cleaned, memories } = extractMemory(answer);
        if (memories.length) {
          const { setMemory } = require('./memory');
          for (const m of memories) setMemory(userId, m.key, m.value);
        }

        const formatted = markdownToWhatsApp(cleaned);
        addMessage(userId, 'user', `[Gambar] ${question || ''}`);
        addMessage(userId, 'model', formatted);
        return formatted;
      } catch (e) { continue; }
    }
  }
  throw new Error('Semua Gemini key + model gagal');
}

module.exports = { askGemini, askGeminiWithImage };
