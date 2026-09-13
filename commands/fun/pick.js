module.exports = {
  name: 'pick',
  alias: ['pilih', 'random'],
  category: 'fun',
  description: 'Pilih random dari beberapa opsi',

  async run({ from, args, sendMessage }) {
    if (!args || args.length < 2) {
      await sendMessage(from, '📝 Format: pick <opsi1> <opsi2> ...\nContoh: pick nasi goreng mie ayam bakso');
      return;
    }
    const picked = args[Math.floor(Math.random() * args.length)];
    await sendMessage(from, `🎲 Bot pilih: *${picked}*`);
  },
};
