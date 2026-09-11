const { askGemini } = require('../../lib/ai-client');

module.exports = {
  name: 'ai',
  alias: ['tanya', 'gemini'],
  category: 'ai',
  description: 'Tanya apa aja ke AI Gemini',

  async run({ sendMessage, from, args }) {
    const question = args.join(' ');
    if (!question) {
      return sendMessage(from, 'Contoh: ai apa itu lubang hitam');
    }
    try {
      const answer = await askGemini(question);
      await sendMessage(from, answer);
    } catch (e) {
      console.error(e);
      await sendMessage(from, `Error: ${e.message}`);
    }
  },
};
