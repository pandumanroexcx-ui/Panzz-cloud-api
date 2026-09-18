const crypto = require('crypto');

module.exports = {
  name: 'hash',
  alias: ['hashgen'],
  category: 'tools',
  description: 'Generate hash (MD5, SHA1, SHA256, SHA512)',

  async run({ from, args, sendMessage }) {
    if (!args?.length) {
      return sendMessage(from,
        '🔐 *HASH GENERATOR*\n\n' +
        'Format: `hash <teks>`\n\n' +
        '*Contoh:*\n' +
        '• `hash hello world`\n' +
        '• `hash password123`\n\n' +
        '_Bot kasih MD5, SHA1, SHA256, SHA512_'
      );
    }

    const text = args.join(' ');
    if (text.length > 500) return sendMessage(from, '❌ Max 500 karakter.');

    const md5 = crypto.createHash('md5').update(text).digest('hex');
    const sha1 = crypto.createHash('sha1').update(text).digest('hex');
    const sha256 = crypto.createHash('sha256').update(text).digest('hex');
    const sha512 = crypto.createHash('sha512').update(text).digest('hex');

    return sendMessage(from,
      `🔐 *HASH: ${text.slice(0, 50)}${text.length > 50 ? '...' : ''}*\n\n` +
      `📌 *MD5:*\n\`${md5}\`\n\n` +
      `📌 *SHA1:*\n\`${sha1}\`\n\n` +
      `📌 *SHA256:*\n\`${sha256}\`\n\n` +
      `📌 *SHA512:*\n\`${sha512.slice(0, 64)}...\`\n\n` +
      `_Full SHA512 panjang banget, kepotong._`
    );
  },
};
