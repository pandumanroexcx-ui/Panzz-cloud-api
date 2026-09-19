const EMOJI_KATEGORI = {
  happy: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤗'],
  sad: ['😢','😭','🥺','😔','😞','😟','😕','🙁','☹️','😣','😖','😫','😩','🥱','😤','😠','😡','🤬','😈','👿'],
  love: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','♥️','💌'],
  animal: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐔','🐧','🐦','🐤','🦆','🦅','🦉'],
  food: ['🍎','🍊','🍋','🍌','🍉','🍇','🍓','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🥑','🥦','🌽','🥕','🍞','🧀','🍗','🍔','🍟','🍕'],
  activity: ['⚽','🏀','🏈','⚾','🎾','🏐','🏉','🎱','🏓','🏸','🥊','🥋','🎽','🛹','🛼','🛷','⛸️','🥌','🎿','⛷️'],
  nature: ['🌲','🌳','🌴','🌵','🌷','🌹','🌺','🌸','🌼','🌻','🌞','🌝','🌚','🌙','⭐','🌟','✨','⚡','🔥','💧'],
  object: ['💡','🔦','🕯️','💎','💰','💸','💳','📱','💻','⌚','📷','🎥','📺','🎧','🎤','🎸','🎹','🎺','🎻','🥁'],
};

const KATEGORI = Object.keys(EMOJI_KATEGORI);

module.exports = {
  name: 'emoji',
  alias: ['emot', 'randomemoji'],
  category: 'fun',
  description: 'Random emoji',

  async run({ from, args, sendMessage }) {
    const kat = (args?.[0] || '').toLowerCase();
    const jumlah = parseInt(args?.[1], 10) || 5;

    let pool, label;
    if (kat && EMOJI_KATEGORI[kat]) {
      pool = EMOJI_KATEGORI[kat];
      label = kat;
    } else if (kat) {
      return sendMessage(from, `❌ Kategori *${kat}* gak ada.\n\n*Tersedia:* ${KATEGORI.join(', ')}`);
    } else {
      const keys = KATEGORI;
      label = keys[Math.floor(Math.random() * keys.length)];
      pool = EMOJI_KATEGORI[label];
    }

    if (jumlah < 1 || jumlah > 30) return sendMessage(from, '❌ Jumlah 1-30.');

    const picks = [];
    for (let i = 0; i < jumlah; i++) {
      picks.push(pool[Math.floor(Math.random() * pool.length)]);
    }

    await sendMessage(from,
      `🎨 *RANDOM EMOJI*\n\n` +
      `Kategori: ${label.toUpperCase()}\n\n` +
      `${picks.join(' ')}\n\n` +
      `_Coba: \`emoji love 10\`_`
    );
  },
};
