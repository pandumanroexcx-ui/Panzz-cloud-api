const { GROQ_KEY_TOOLS, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');

const LANG_MAP = {
  en:'Inggris', id:'Indonesia', jp:'Jepang', jv:'Jawa', su:'Sunda',
  ar:'Arab', kr:'Korea', cn:'Mandarin', es:'Spanyol', fr:'Prancis',
  de:'Jerman', ru:'Rusia', th:'Thailand', vi:'Vietnam',
};

module.exports = {
  name: 'tr',
  alias: ['translate', 'terjemah'],
  category: 'tools',
  description: 'Translate teks',

  async run({ from, args, sendMessage }) {
    if (!args || args.length < 2) {
      await sendMessage(from, '📝 Format: tr <kode> <teks>\nContoh: tr en Aku cinta kamu');
      return;
    }
    const lang = args[0];
    const text = args.slice(1).join(' ');
    if (text.length > 1000) return sendMessage(from, '❌ Max 1000 karakter.');

    await sendMessage(from, '🌐 Lagi diterjemahin...');
    try {
      const apiKey = GROQ_KEY_TOOLS || GROQ_API_KEY;
      const langName = LANG_MAP[lang.toLowerCase()] || lang;
      const result = await callGroq({
        apiKey,
        prompt: `Terjemahkan ke bahasa ${langName}. Jawab HANYA terjemahan:\n\n${text}`,
      });
      await sendMessage(from, `🌐 *${langName}:*\n\n${result}`);
    } catch (e) {
      console.error('Translate error:', e.message);
      await sendMessage(from, `❌ Gagal: ${e.message}`);
    }
  },
};
