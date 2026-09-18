module.exports = {
  name: 'angka',
  alias: ['rand', 'randomnumber', 'rng'],
  category: 'fun',
  description: 'Random number generator',

  async run({ from, args, sendMessage }) {
    const min = parseInt(args?.[0], 10) || 1;
    const max = parseInt(args?.[1], 10) || 100;

    if (min >= max) {
      return sendMessage(from, '❌ Format: `angka <min> <max>`\n\nContoh: `angka 1 100`\nDefault: `angka`');
    }

    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    await sendMessage(from, `🎲 *ANGKA RANDOM*\n\nRange: ${min} - ${max}\nHasil: *${num}*`);
  },
};
