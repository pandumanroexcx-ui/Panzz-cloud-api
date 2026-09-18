module.exports = {
  name: 'duel',
  alias: ['aduduel', 'siapa'],
  category: 'fun',
  description: 'Duel 2 nama random',

  async run({ from, args, sendMessage }) {
    const raw = args.join(' ').trim();
    if (!raw) {
      return sendMessage(from,
        '⚔️ *DUEL 2 NAMA*\n\n' +
        'Format: `duel <nama1> vs <nama2>`\n' +
        'Atau: `duel <nama1> | <nama2>`\n\n' +
        '*Contoh:*\n' +
        '• `duel Panzz vs Andi`\n' +
        '• `duel Andi | Budi`'
      );
    }

    let n1, n2;
    if (raw.toLowerCase().includes(' vs ')) {
      const parts = raw.split(/\s+vs\s+/i);
      n1 = parts[0]; n2 = parts[1];
    } else if (raw.includes('|')) {
      const parts = raw.split('|').map(s => s.trim());
      n1 = parts[0]; n2 = parts[1];
    } else {
      const parts = raw.split(/\s+/);
      n1 = parts[0]; n2 = parts[1];
    }

    if (!n1 || !n2) return sendMessage(from, '❌ Format: `duel Andi vs Budi`');

    const skill1 = Math.floor(Math.random() * 100) + 1;
    const skill2 = Math.floor(Math.random() * 100) + 1;
    const winner = skill1 > skill2 ? n1 : (skill2 > skill1 ? n2 : 'SERI');

    const bar = (n) => '█'.repeat(Math.round(n / 10)) + '░'.repeat(10 - Math.round(n / 10));

    let result;
    if (winner === 'SERI') result = '🤝 SERI! Keduanya seimbang.';
    else result = `🏆 *${winner} MENANG!*`;

    await sendMessage(from,
      `⚔️ *DUEL*\n\n` +
      `🗡️ *${n1}*\n${bar(skill1)} ${skill1}\n\n` +
      `🛡️ *${n2}*\n${bar(skill2)} ${skill2}\n\n` +
      `${result}`
    );
  },
};
