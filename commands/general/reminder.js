module.exports = {
  name: 'reminder',
  alias: ['ingatkan'],
  category: 'general',
  description: 'Set reminder. Contoh: reminder 10m Minum air',

  async run({ sendMessage, from, args }) {
    if (args.length < 2) {
      return sendMessage(from, 'Contoh: reminder 10m Minum air\nAtau: reminder 30 Jangan lupa istirahat (30 = menit)');
    }

    const durasiStr = args[0].replace(/m$/i, '');
    const menit = parseInt(durasiStr, 10);
    const pesan = args.slice(1).join(' ');

    if (isNaN(menit) || menit <= 0) {
      return sendMessage(from, 'Format waktu salah. Contoh: reminder 10m Minum air');
    }
    if (menit > 1440) {
      return sendMessage(from, 'Maksimal reminder 24 jam (1440 menit) ke depan.');
    }

    await sendMessage(from, `⏰ Oke, aku ingetin dalam ${menit} menit: "${pesan}"`);

    setTimeout(async () => {
      await sendMessage(from, `⏰ *REMINDER*\n\n${pesan}`);
    }, menit * 60 * 1000);
  },
};
