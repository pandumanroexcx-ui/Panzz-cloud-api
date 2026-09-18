module.exports = {
  name: 'palindrom',
  alias: ['palindrome'],
  category: 'tools',
  description: 'Cek kata/frasa palindrom',

  async run({ from, args, sendMessage }) {
    const text = args.join(' ').trim();
    if (!text) {
      return sendMessage(from,
        '🔤 *CEK PALINDROM*\n\n' +
        'Format: `palindrom <kata/frasa>`\n\n' +
        '*Contoh:*\n' +
        '• `palindrom katak`\n' +
        '• `palindrom malam`\n' +
        '• `palindrom kasur rusak`'
      );
    }
    if (text.length > 500) return sendMessage(from, '❌ Max 500 karakter.');

    const clean = text.toLowerCase().replace(/[^a-z0-9]/g, '');
    const reversed = clean.split('').reverse().join('');
    const isPalindrom = clean === reversed && clean.length > 0;

    return sendMessage(from,
      `${isPalindrom ? '✅' : '❌'} *${isPalindrom ? 'PALINDROM' : 'BUKAN PALINDROM'}*\n\n` +
      `📝 Input: ${text}\n` +
      `🔤 Bersih: \`${clean}\`\n` +
      `🔄 Terbalik: \`${reversed}\`\n\n` +
      (isPalindrom ? 'Dibaca dari depan & belakang sama! 🎉' : 'Dibaca dari depan & belakang beda.')
    );
  },
};
