const GROQ_MODELS = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'llama-3.1-8b-instant',
];

function parseKeys(input) {
  if (!input) return [];
  return String(input).split(',').map(k => k.trim()).filter(Boolean);
}

function getAllKeys() {
  const keys = [];
  if (process.env.GROQ_API_KEY) keys.push(...parseKeys(process.env.GROQ_API_KEY));
  for (let i = 1; i <= 8; i++) {
    const k = process.env[`GROQ_KEY_${i}`];
    if (k) keys.push(...parseKeys(k));
  }
  return [...new Set(keys)];
}

async function callGroq({ apiKey, prompt, systemPrompt, responseJson, timeoutMs = 30000 }) {
  const keys = apiKey ? parseKeys(apiKey) : getAllKeys();
  if (keys.length === 0) throw new Error('GROQ_API_KEY kosong');

  let lastError = null;

  for (const key of keys) {
    for (const model of GROQ_MODELS) {
      try {
        const messages = [];
        if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
        messages.push({ role: 'user', content: prompt });

        const body = { model, messages, temperature: 0.8 };
        if (responseJson) body.response_format = { type: 'json_object' };

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`,
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(timeoutMs),
        });

        const data = await res.json();

        if (data.error) {
          const msg = data.error.message || '';
          console.log(`[GROQ] ${model} + key ...${key.slice(-6)}: ${msg.slice(0, 80)}`);
          lastError = new Error(msg);
          continue;
        }

        const text = data.choices?.[0]?.message?.content;
        if (!text) {
          lastError = new Error('No content in response');
          continue;
        }

        console.log(`[GROQ] OK via ${model} (key ...${key.slice(-6)})`);
        return text.trim();
      } catch (e) {
        lastError = e;
        console.log(`[GROQ] ${model} error: ${e.message}`);
      }
    }
  }

  throw lastError || new Error('Semua Groq key + model gagal');
}

module.exports = { callGroq, GROQ_MODELS, getAllKeys };
