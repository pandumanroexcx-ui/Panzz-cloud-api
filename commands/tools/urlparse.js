module.exports = {
  name: 'urlparse',
  alias: ['parseurl', 'urlinfo'],
  category: 'tools',
  description: 'Parse URL (host, path, query, dll)',

  async run({ from, args, sendMessage }) {
    const input = args.join(' ').trim();
    if (!input) return sendMessage(from, '🔗 Format: `urlparse <url>`\nContoh: `urlparse https://google.com/search?q=test&page=2`');

    let url;
    try {
      url = new URL(input.startsWith('http') ? input : 'https://' + input);
    } catch (e) {
      return sendMessage(from, '❌ URL gak valid.');
    }

    let text = `🔗 *URL PARSER*\n\n`;
    text += `🌐 Protocol: \`${url.protocol}\`\n`;
    text += `🏠 Host: \`${url.hostname}\`\n`;
    if (url.port) text += `🔌 Port: \`${url.port}\`\n`;
    text += `📁 Path: \`${url.pathname}\`\n`;

    if (url.searchParams && [...url.searchParams].length) {
      text += `\n*Query Params:*\n`;
      for (const [k, v] of url.searchParams) {
        text += `• \`${k}\` = \`${v}\`\n`;
      }
    }
    if (url.hash) text += `\n#️⃣ Hash: \`${url.hash}\`\n`;

    await sendMessage(from, text);
  },
};
