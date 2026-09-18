module.exports = {
  name: 'flip',
  alias: ['coinflip', 'lempar'],
  category: 'fun',
  description: 'Lempar koin (head/tail)',

  async run({ from, args, sendMessage }) {
    const guess = (args?.[0] || '').toLowerCase();
    const result = Math.random() < 0.5 ? 'head' : 'tail';
    const emoji = result === 'head' ? '👑' : '🪙';

    if (guess === 'head' || guess === 'h' || guess === 'kepala') {
      const menang = result === 'head';
      return sendMessage(from, `${emoji} Koin: *${result.toUpperCase()}*\n\n${menang ? '🎉 Kamu MENANG!' : '😭 Kamu KALAH!'}`);
    }
    if (guess === 'tail' || guess === 't' || guess === 'ekor') {
      const menang = result === 'tail';
      return sendMessage(from, `${emoji} Koin: *${result.toUpperCase()}*\n\n${menang ? '🎉 Kamu MENANG!' : '😭 Kamu KALAH!'}`);
    }

    await sendMessage(from, `${emoji} *${result.toUpperCase()}*\n\n_Tebak: \`flip head\` atau \`flip tail\`_`);
  },
};
