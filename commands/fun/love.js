module.exports = {
  name: 'love',
  alias: ['cinta', 'jodoh'],
  category: 'fun',
  description: 'Love calculator (kalkulator kecocokan)',

  async run({ from, args, sendMessage }) {
    if (!args || args.length < 2) {
      return sendMessage(from,
        '💕 *LOVE CALCULATOR*\n\n' +
        'Format: `love <nama1> <nama2>`\n\n' +
        '*Contoh:*\n' +
        '• `love Panzz Sarah`\n' +
        '• `love Budi Ani`'
      );
    }

    // Format: love Andi | Sarah  atau  love Andi Sarah
    let n1, n2;
    if (args.join(' ').includes('|')) {
      const parts = args.join(' ').split('|').map(s => s.trim());
      n1 = parts[0]; n2 = parts[1];
    } else {
      // Kalau tanpa |, coba split berdasarkan kapital atau asumsi nama pertama = 1 kata
      n1 = args[0];
      n2 = args.slice(1).join(' ');
    }

    if (!n1 || !n2) return sendMessage(from, '❌ Format: `love Nama1 Nama2`\nAtau: `love Nama1 | Nama2`');

    // Deterministic hash biar hasil konsisten untuk nama yang sama
    const str = (n1 + n2).toLowerCase().split('').sort().join('');
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash) + str.charCodeAt(i);
    const persen = Math.abs(hash) % 101;

    let status, emoji;
    if (persen >= 90) { status = 'JODOH BANGET! 💍'; emoji = '💖'; }
    else if (persen >= 75) { status = 'Cocok banget!'; emoji = '💕'; }
    else if (persen >= 60) { status = 'Ada potensi!'; emoji = '💗'; }
    else if (persen >= 40) { status = 'Bisa coba dulu'; emoji = '💓'; }
    else if (persen >= 20) { status = 'Teman aja kayaknya'; emoji = '💔'; }
    else { status = 'Mending cari yang lain 😅'; emoji = '💀'; }

    const bar = '█'.repeat(Math.round(persen / 5)) + '░'.repeat(20 - Math.round(persen / 5));

    await sendMessage(from,
      `💘 *LOVE CALCULATOR*\n\n` +
      `👤 ${n1}\n❤️ ${n2}\n\n` +
      `${emoji} ${bar} *${persen}%*\n\n` +
      `*${status}*\n\n` +
      `_⚠️ Cuma buat seru-seruan_`
    );
  },
};
