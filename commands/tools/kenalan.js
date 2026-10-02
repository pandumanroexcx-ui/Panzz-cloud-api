const { setMemory, getMemory, resetMemory } = require('../../lib/memory');

module.exports = {
  name: 'kenalan',
  alias: ['ingat', 'about'],
  category: 'tools',
  description: 'Kasih info tentang kamu biar bot inget',

  async run({ from, args, sendMessage, message }) {
    const sub = (args?.[0] || '').toLowerCase();

    if (sub === 'lihat' || sub === 'list' || sub === 'cek') {
      const memory = getMemory(from);
      const keys = Object.keys(memory);
      if (!keys.length) return sendMessage(from, '🧠 Bot belum tau apa-apa tentang kamu.\n\nKetik: `kenalan namaku Panzz`');
      const lines = keys.map(k => `• *${k}*: ${memory[k]}`);
      return sendMessage(from, `🧠 *BOT INGET INI TENTANG KAMU*\n\n${lines.join('\n')}`);
    }

    if (sub === 'reset' || sub === 'hapus') {
      const n = resetMemory(from);
      return sendMessage(from, `✅ ${n} memori tentang kamu dihapus.`);
    }

    // Format: kenalan <key> <value>
    // Atau: kenalan namaku Panzz
    if (args.length >= 2) {
      let key = args[0].toLowerCase().replace(/ku$/, '').replace(/saya$/, '');
      const value = args.slice(1).join(' ');
      // Normalisasi key
      if (key === 'nama') key = 'nama';
      if (key === 'umur' || key === 'usia') key = 'umur';
      if (key === 'ultah' || key === 'ulangtahun') key = 'ultah';
      if (key === 'hobi' || key === 'kesukaan') key = 'hobi';
      if (key === 'kerja' || key === 'kerjaan' || key === 'pekerjaan') key = 'pekerjaan';
      if (key === 'sekolah' || key === 'kuliah') key = 'sekolah';
      if (key === 'tinggal' || key === 'alamat' || key === 'kota') key = 'kota';
      if (key === 'pacar' || key === 'gebetan') key = 'pacar';

      setMemory(from, key, value);
      return sendMessage(from, `🧠 Oke, aku inget ya!\n\n*${key}*: ${value}`);
    }

    // Help
    return sendMessage(from,
      '🧠 *KENALAN SAMA BOT*\n\n' +
      'Kasih info biar bot inget kamu:\n\n' +
      '• `kenalan namaku Panzz`\n' +
      '• `kenalan umurku 22`\n' +
      '• `kenalan hobi coding`\n' +
      '• `kenalan ultah 15/08/2000`\n' +
      '• `kenalan kota Jakarta`\n\n' +
      '*Lihat memori:* `kenalan lihat`\n' +
      '*Reset:* `kenalan reset`\n\n' +
      '_Bot juga otomatis inget dari chat biasa._'
    );
  },
};
