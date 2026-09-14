module.exports = {
  name: 'info',
  alias: ['detail', 'cmd'],
  category: 'general',
  description: 'Lihat detail command',

  async run({ from, args, sendMessage, commands }) {
    if (!args?.[0]) {
      await sendMessage(from,
        '📖 *Format:* .info <command>\n\n' +
        '*Contoh:*\n' +
        '.info kuis\n' +
        '.info confess\n' +
        '.info routine\n\n' +
        '_Ketik .menu buat lihat semua command._'
      );
      return;
    }

    const name = args[0].toLowerCase();
    const cmd = commands.get(name);

    if (!cmd) {
      await sendMessage(from, `❌ Command *${name}* gak ketemu.\n\nKetik .menu buat lihat semua command.`);
      return;
    }

    const CATEGORY_EMOJI = {
      general: '📋',
      fun: '🎮',
      tools: '🛠️',
      ai: '🤖',
    };
    const emoji = CATEGORY_EMOJI[cmd.category] || '📁';

    let text = `📖 *DETAIL COMMAND*\n\n`;
    text += `📝 Nama: *.${cmd.name}*\n`;
    if (cmd.alias?.length) {
      text += `🔀 Alias: ${cmd.alias.map(a => `.${a}`).join(', ')}\n`;
    }
    text += `${emoji} Kategori: ${cmd.category || '-'}\n`;
    text += `💬 Deskripsi: ${cmd.description || '-'}\n`;

    // Coba kasih contoh
    const EXAMPLES = {
      pick: '.pick nasi mie bakso',
      kuis: '.kuis sejarah',
      jokes: '.jokes',
      ramal: '.ramal Leo',
      cerita: '.cerita horor',
      wyr: '.wyr',
      tr: '.tr en Aku cinta kamu',
      ringkas: '.ringkas https://id.wikipedia.org/wiki/Soekarno',
      confess: '.confess 628123456789 Sarah Aku suka kamu',
      routine: '.routine add 07:00 Waktunya sarapan',
      remind: '.remind 5m minum obat',
      pass: '.pass 20',
      cek: '.cek google.com',
      stats: '.stats',
      dadu: '.dadu',
      koin: '.koin',
      quote: '.quote',
      tod: '.tod',
      tebak: '.tebak',
      cuaca: '.cuaca Jakarta',
      menu: '.menu',
      info: '.info kuis',
    };

    if (EXAMPLES[cmd.name]) {
      text += `\n📌 *Contoh:*\n\`${EXAMPLES[cmd.name]}\``;
    }

    await sendMessage(from, text);
  },
};
