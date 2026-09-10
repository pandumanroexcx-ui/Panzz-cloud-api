module.exports = {
  name: 'ping',
  alias: ['p'],
  category: 'general',
  description: 'Cek bot hidup',
  async run({ sendMessage, from }) {
    await sendMessage(from, 'Pong! 🏓');
  },
};
