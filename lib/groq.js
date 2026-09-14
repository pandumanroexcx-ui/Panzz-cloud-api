const GROQ_MODELS = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'llama-3.1-8b-instant',
];

async function callGroq({ apiKey, prompt, systemPrompt, responseJson, timeoutMs = 30000 }) {
  if (!apiKey) throw new Error('GROQ_API_KEY kosong');

  let lastError = null;

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
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
      });

      const data = await res.json();

      if (data.error) {
        const msg = data.error.message || '';
        console.log(`[GROQ] ${model} error: ${msg}`);
        lastError = new Error(msg);
        continue;
      }

      const text = data.choices?.[0]?.message?.content;
      if (!text) {
        lastError = new Error('No content in response');
        continue;
      }

      console.log(`[GROQ] OK via ${model}`);
      return text.trim();
    } catch (e) {
      lastError = e;
      console.log(`[GROQ] ${model} error: ${e.message}`);
    }
  }

  throw lastError || new Error('Semua Groq model gagal');
}

module.exports = { callGroq, GROQ_MODELS };
