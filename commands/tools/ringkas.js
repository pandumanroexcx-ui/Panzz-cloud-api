const { GROQ_KEY_TOOLS, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');

async function fetchArticle(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Fetch gagal (${res.status})`);
  let html = await res.text();
  html = html.replace(/<script[\s\S]*?<\/script>/gi, '')
             .replace(/<style[\s\S]*?<\/style>/gi, '')
             .replace(/<nav[\s\S]*?<\/nav>/gi, '')
             .replace(/<header[\s\S]*?<\/header>/gi, '')
             .replace(/<footer[\s\S]*?<\/footer>/gi, '')
             .replace(/<[^>]+>/g, ' ')
             .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
             .replace(/\s+/g, ' ').trim();
  return html.slice(0, 8000);
}

module.exports = {
  name: 'ringkas',
  alias: ['summary', 'rangkum'],
  category: 'tools',
  description: 'Ringkas artikel dari link',

  async run({ from, args, sendMessage }) {
    if (!args?.[0]?.startsWith('http')) {
      await sendMessage(from, '📝 Format: ringkas <url>');
      return;
    }
    await sendMessage(from, '📰 Lagi baca & ringkas...');
    try {
      const text = await fetchArticle(args[0]);
      if (text.length < 200) throw new Error('Artikel kekurangan teks');
      const apiKey = GROQ_KEY_TOOLS || GROQ_API_KEY;
      const summary = await callGroq({
        apiKey,
        prompt: `Ringkas artikel jadi 3-5 poin utama dalam bahasa Indonesia:\n\n${text}`,
      });
      await sendMessage(from, `📰 *RINGKASAN*\n\n${summary}\n\n🔗 ${args[0]}`);
    } catch (e) {
      console.error('Ringkas error:', e.message);
      await sendMessage(from, `❌ Gagal: ${e.message}`);
    }
  },
};
