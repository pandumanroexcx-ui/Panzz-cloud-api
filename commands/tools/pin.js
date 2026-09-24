module.exports = {
  name: 'pin',
  alias: ['pinrandom', 'kodepin'],
  category: 'tools',
  description: 'Generate PIN random',

  async run({ from, args, sendMessage }) {
    const panjang = parseInt(args?.[0], 10) || 6;
    if (panjang < 4 || panjang > 12) {
      return sendMessage(from,
        '🔢 *PIN GENERATOR*\n\n' +
        '*Format:* `pin [panjang]`\n\n' +
        '*Contoh:*\n' +
        '• `pin` — 6 digit (default)\n' +
        '• `pin 4` — 4 digit\n' +
        '• `pin 8` — 8 digit\n\n' +
        '*Range:* 4-12 digit'
      );
    }

    const jumlah = parseInt(args?.[1], 10) || 1;
    if (jumlah < 1 || jumlah > 10) return sendMessage(from, '❌ Jumlah PIN 1-10.');

    const pins = [];
    for (let i = 0; i < jumlah; i++) {
      let pin = '';
      for (let j = 0; j < panjang; j++) {
        pin += Math.floor(Math.random() * 10);
      }
      pins.push(pin);
    }

    await sendMessage(from,
      `🔢 *PIN GENERATOR*\n\n` +
      `📏 Panjang: ${panjang} digit\n` +
      `🔢 Jumlah: ${jumlah}\n\n` +
      pins.map((p, i) => `*${i + 1}.* \`${p}\``).join('\n') +
      `\n\n_⚠️ Simpen di tempat aman!_`
    );
  },
};
