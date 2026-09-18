module.exports = {
  name: 'wheel',
  alias: ['spin', 'putar', 'pilihrandom'],
  category: 'fun',
  description: 'Spin wheel / pilih random dari list',

  async run({ from, args, sendMessage }) {
    if (!args?.length) {
      return sendMessage(from,
        '🎡 *SPIN WHEEL*\n\n' +
        'Format: `wheel <opsi1> | <opsi2> | <opsi3>`\n\n' +
        '*Contoh:*\n' +
        '• `wheel Nasi Goreng | Mie Ayam | Bakso`\n' +
        '• `wheel Andi | Budi | Sari | Rina`\n\n' +
        '_Atau pake koma: `wheel Nasi, Mie, Bakso`_'
      );
    }

    const raw = args.join(' ');
    let items;
    if (raw.includes('|')) items = raw.split('|').map(s => s.trim()).filter(Boolean);
    else if (raw.includes(',')) items = raw.split(',').map(s => s.trim()).filter(Boolean);
    else items = raw.split(/\s+/).filter(Boolean);

    if (items.length < 2) return sendMessage(from, '❌ Minimal 2 opsi.');
    if (items.length > 20) return sendMessage(from, '❌ Max 20 opsi.');

    const picked = items[Math.floor(Math.random() * items.length)];
    const idx = items.indexOf(picked) + 1;

    // Visual spinner sederhana
    const lines = items.map((it, i) => `${i + 1 === idx ? '👉' : '  '} ${it}`);
    const maxLen = Math.max(...items.map(i => i.length));

    await sendMessage(from,
      `🎡 *SPIN WHEEL*\n\n` +
      `📋 Opsi:\n${lines.join('\n')}\n\n` +
      `🎯 *Terpilih:*\n┌${'─'.repeat(maxLen + 4)}┐\n│  ${picked.padEnd(maxLen)}  │\n└${'─'.repeat(maxLen + 4)}┘`
    );
  },
};
