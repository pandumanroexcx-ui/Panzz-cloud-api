const MOVES = {
  'batu': { emoji: '✊', beats: 'gunting' },
  'gunting': { emoji: '✌️', beats: 'kertas' },
  'kertas': { emoji: '✋', beats: 'batu' },
  'p': { emoji: '✊', name: 'batu', beats: 'gunting' }, // alias
  'g': { emoji: '✌️', name: 'gunting', beats: 'kertas' },
  'k': { emoji: '✋', name: 'kertas', beats: 'batu' },
};

const CHOICES = ['batu', 'gunting', 'kertas'];

module.exports = {
  name: 'suit',
  alias: ['janken', 'suten', 'rps'],
  category: 'fun',
  description: 'Main suit lawan bot (batu-gunting-kertas)',

  async run({ from, args, sendMessage }) {
    let userMove = (args?.[0] || '').toLowerCase();

    // Alias
    if (userMove === 'p' || userMove === 'b') userMove = 'batu';
    else if (userMove === 'g') userMove = 'gunting';
    else if (userMove === 'k') userMove = 'kertas';

    if (!CHOICES.includes(userMove)) {
      return sendMessage(from,
        '✊✋✌️ *SUIT LAWAN BOT*\n\n' +
        '*Format:* `suit <pilihan>`\n\n' +
        '*Pilihan:*\n' +
        '• `suit batu` (atau `suit b`)\n' +
        '• `suit gunting` (atau `suit g`)\n' +
        '• `suit kertas` (atau `suit k`)\n\n' +
        '*Aturan:*\n' +
        '✊ Batu ngalahin ✌️ Gunting\n' +
        '✌️ Gunting ngalahin ✋ Kertas\n' +
        '✋ Kertas ngalahin ✊ Batu'
      );
    }

    const botMove = CHOICES[Math.floor(Math.random() * 3)];
    const userEmoji = MOVES[userMove].emoji;
    const botEmoji = MOVES[botMove].emoji;

    let hasil, emoji;
    if (userMove === botMove) {
      hasil = 'SERI! 🤝';
      emoji = '🤝';
    } else if (MOVES[userMove].beats === botMove) {
      hasil = 'KAMU MENANG! 🎉';
      emoji = '🏆';
    } else {
      hasil = 'BOT MENANG! 🤖';
      emoji = '😭';
    }

    await sendMessage(from,
      `${emoji} *HASIL SUIT*\n\n` +
      `Kamu: ${userEmoji} ${userMove}\n` +
      `Bot:  ${botEmoji} ${botMove}\n\n` +
      `*${hasil}*`
    );
  },
};
