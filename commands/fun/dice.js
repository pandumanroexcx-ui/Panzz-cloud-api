const DICE = {
  4: 'D4', 6: 'D6', 8: 'D8', 10: 'D10', 12: 'D12', 20: 'D20', 100: 'D100',
};

module.exports = {
  name: 'roll',
  alias: ['dice20', 'd20'],
  category: 'fun',
  description: 'Lempar dadu (D4/D6/D8/D10/D12/D20/D100)',

  async run({ from, args, sendMessage }) {
    const sub = (args?.[0] || '').toLowerCase();
    const jumlah = parseInt(args?.[1], 10) || 1;

    if (!sub || !DICE[sub.replace('d', '')]) {
      return sendMessage(from,
        '🎲 *DICE ROLLER*\n\n' +
        'Format: `roll <dN> [jumlah]`\n\n' +
        '*Contoh:*\n' +
        '• `roll d6` — 1 dadu 6 sisi\n' +
        '• `roll d20 3` — 3 dadu 20 sisi\n' +
        '• `roll d100`\n\n' +
        '*Sisi tersedia:* d4, d6, d8, d10, d12, d20, d100'
      );
    }

    const sisi = parseInt(sub.replace('d', ''), 10);
    if (jumlah < 1 || jumlah > 20) return sendMessage(from, '❌ Jumlah dadu 1-20.');

    const rolls = [];
    for (let i = 0; i < jumlah; i++) {
      rolls.push(Math.floor(Math.random() * sisi) + 1);
    }
    const total = rolls.reduce((a, b) => a + b, 0);

    let text = `🎲 *ROLL ${jumlah}d${sisi}*\n\n`;
    if (jumlah === 1) {
      text += `Hasil: *${total}*`;
      if (sisi === 20) {
        if (total === 20) text += '\n\n🎉 *CRITICAL HIT!*';
        else if (total === 1) text += '\n\n💀 *CRITICAL MISS!*';
      }
    } else {
      text += `Dadu: ${rolls.join(', ')}\n`;
      text += `Total: *${total}*\n`;
      text += `Rata-rata: ${(total / jumlah).toFixed(1)}`;
    }

    await sendMessage(from, text);
  },
};
