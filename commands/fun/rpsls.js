// Rock Paper Scissors Lizard Spock
const MOVES = ['batu', 'gunting', 'kertas', 'kadal', 'spock'];
const EMOJI = { batu: '✊', gunting: '✌️', kertas: '✋', kadal: '🦎', spock: '🖖' };

// Rules: key menang vs value
const BEATS = {
  batu: ['gunting', 'kadal'],
  gunting: ['kertas', 'kadal'],
  kertas: ['batu', 'spock'],
  kadal: ['kertas', 'spock'],
  spock: ['batu', 'gunting'],
};

// Alias
const ALIAS = { r: 'batu', p: 'kertas', s: 'gunting', l: 'kadal', v: 'spock' };

module.exports = {
  name: 'rpsls',
  alias: ['spock', 'suit5'],
  category: 'fun',
  description: 'Rock Paper Scissors Lizard Spock (Big Bang Theory)',

  async run({ from, args, sendMessage }) {
    let userMove = (args?.[0] || '').toLowerCase();
    userMove = ALIAS[userMove] || userMove;

    if (!MOVES.includes(userMove)) {
      return sendMessage(from,
        '🖖 *ROCK PAPER SCISSORS LIZARD SPOCK*\n\n' +
        'Format: `rpsls <pilihan>`\n\n' +
        '*Pilihan:*\n' +
        '✊ batu (r)\n' +
        '✌️ gunting (s)\n' +
        '✋ kertas (p)\n' +
        '🦎 kadal (l)\n' +
        '🖖 spock (v)\n\n' +
        '*Aturan:*\n' +
        '• Gunting potong Kertas\n' +
        '• Kertas bungkus Batu\n' +
        '• Batu hancurkan Kadal\n' +
        '• Kadal racuni Spock\n' +
        '• Spock hancurkan Gunting\n' +
        '• Gunting matiin Kadal\n' +
        '• Kadal makan Kertas\n' +
        '• Kertas bantah Spock\n' +
        '• Spock uapin Batu\n' +
        '• Batu tumpulin Gunting'
      );
    }

    const botMove = MOVES[Math.floor(Math.random() * MOVES.length)];
    let hasil;
    if (userMove === botMove) hasil = 'SERI! 🤝';
    else if (BEATS[userMove].includes(botMove)) hasil = 'KAMU MENANG! 🎉';
    else hasil = 'BOT MENANG! 🤖';

    await sendMessage(from,
      `🖖 *RPSLS*\n\n` +
      `Kamu: ${EMOJI[userMove]} ${userMove}\n` +
      `Bot:  ${EMOJI[botMove]} ${botMove}\n\n` +
      `*${hasil}*`
    );
  },
};
