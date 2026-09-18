const MOVES = ['batu', 'gunting', 'kertas'];
const EMOJI = { batu: '✊', gunting: '✌️', kertas: '✋' };

module.exports = {
  name: 'suitmulti',
  alias: ['suit3', 'bestof3'],
  category: 'fun',
  description: 'Suit best of 3 lawan bot',

  async run({ from, args, sendMessage }) {
    const userMove = (args?.[0] || '').toLowerCase();
    if (!MOVES.includes(userMove)) {
      return sendMessage(from, '✊✋✌️ *SUIT BEST OF 3*\n\nFormat: `suitmulti batu` / `suitmulti gunting` / `suitmulti kertas`\n\n_Main 3 ronde, siapa menang 2x dulu._');
    }

    let userWins = 0, botWins = 0;
    let log = '';

    for (let i = 1; i <= 3; i++) {
      const botMove = MOVES[Math.floor(Math.random() * 3)];
      let hasil;
      if (userMove === botMove) hasil = 'SERI';
      else if ((userMove === 'batu' && botMove === 'gunting') ||
               (userMove === 'gunting' && botMove === 'kertas') ||
               (userMove === 'kertas' && botMove === 'batu')) {
        hasil = 'MENANG'; userWins++;
      } else { hasil = 'KALAH'; botWins++; }

      log += `Ronde ${i}: ${EMOJI[userMove]} vs ${EMOJI[botMove]} — ${hasil}\n`;
      if (userWins === 2 || botWins === 2) break;
    }

    const final = userWins > botWins ? '🎉 KAMU MENANG!' : userWins < botWins ? '😭 BOT MENANG!' : '🤝 SERI!';

    await sendMessage(from, `✊✋✌️ *SUIT BEST OF 3*\n\n${log}\nSkor: Kamu ${userWins} - Bot ${botWins}\n\n*${final}*`);
  },
};
