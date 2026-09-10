module.exports = {
  name: 'menu',
  alias: ['help'],
  category: 'general',
  description: 'Lihat semua command',
  async run({ sendMessage, from, commands }) {
    const seen = new Set();
    let text = '🤖 *MENU BOT*\n\n';
    for (const cmd of commands.values()) {
      if (seen.has(cmd.name)) continue;
      seen.add(cmd.name);
      text += `• ${cmd.name} - ${cmd.description || ''}\n`;
    }
    await sendMessage(from, text.trim());
  },
};
