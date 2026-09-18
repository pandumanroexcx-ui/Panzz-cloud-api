module.exports = {
  name: 'among',
  alias: ['amongus', 'impostor'],
  category: 'fun',
  description: 'Random impostor Among Us',

  async run({ from, args, sendMessage }) {
    if (!args?.length) {
      return sendMessage(from,
        '🚀 *AMONG US RANDOM*\n\n' +
        'Format: `among <nama1> <nama2> <nama3> ...`\n' +
        'Atau: `among <nama1> | <nama2> | <nama3>`\n\n' +
        '*Contoh:*\n' +
        '• `among Andi | Budi | Sari | Rina`\n' +
        '• `among Panzz, Sarah, Ari`'
      );
    }

    const raw = args.join(' ');
    let names;
    if (raw.includes('|')) names = raw.split('|').map(s => s.trim()).filter(Boolean);
    else if (raw.includes(',')) names = raw.split(',').map(s => s.trim()).filter(Boolean);
    else names = raw.split(/\s+/).filter(Boolean);

    if (names.length < 3) return sendMessage(from, '❌ Minimal 3 nama.');

    const impostor = names[Math.floor(Math.random() * names.length)];
    const listLines = names.map(n => n === impostor ? `👎 ${n}` : `👨‍🚀 ${n}`).join('\n');

    await sendMessage(from,
      `🚀 *AMONG US*\n\n` +
      `Pemain:\n${listLines}\n\n` +
      `🔪 *IMPOSTOR: ${impostor}*`
    );
  },
};
