module.exports = {
  name: 'dadu',
  alias: ['dice', 'koin', 'coin'],
  category: 'fun',
  description: 'Random dadu (1-6) atau koin (head/tail)',

  async run({ from, sendMessage, message }) {
    const cmd = message.text.body.trim().toLowerCase().split(' ')[0].replace(/^\//, '');

    if (cmd === 'koin' || cmd === 'coin') {
      const hasil = Math.random() < 0.5 ? '🪙 *KEPALA (Head)*' : '🪙 *EKOR (Tail)*';
      await sendMessage(from, hasil);
    } else {
      const dadu = Math.floor(Math.random() * 6) + 1;
      const emoji = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][dadu - 1];
      await sendMessage(from, `${emoji} Dadu: *${dadu}*`);
    }
  },
};
