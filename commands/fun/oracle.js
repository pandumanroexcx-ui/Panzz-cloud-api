const JAWABAN_YES = [
  '✅ Ya! Pastikan lakukan sekarang.',
  '✅ Ya, semesta mendukung.',
  '✅ Ya, peluang besar!',
  '✅ Ya, tapi jangan buru-buru.',
  '✅ Ya, dengan persiapan matang.',
];
const JAWABAN_NO = [
  '❌ Tidak, tahan dulu.',
  '❌ Belum waktunya.',
  '❌ Sebaiknya jangan.',
  '❌ Tidak, cari opsi lain.',
  '❌ Tidak, tunggu momen tepat.',
];
const JAWABAN_MUNGKIN = [
  '🤔 Mungkin, tergantung situasi.',
  '🤔 Coba pikir lagi 1-2 hari.',
  '🤔 Bisa iya bisa tidak, tanya hatimu.',
  '🤔 50:50, gak bisa dipastiin.',
  '🤔 Hasilnya tergantung usahamu.',
];

module.exports = {
  name: 'oracle',
  alias: ['ramal2', 'tanya', 'yesno'],
  category: 'fun',
  description: 'Yes/No oracle random',

  async run({ from, args, sendMessage }) {
    if (!args?.length) {
      return sendMessage(from,
        '🔮 *ORACLE YES/NO*\n\n' +
        '*Format:* `oracle <pertanyaan>`\n\n' +
        '*Contoh:*\n' +
        '• `oracle apakah aku harus resign?`\n' +
        '• `oracle apakah dia suka sama aku?`\n' +
        '• `oracle apakah besok hujan?`\n\n' +
        '_Bot kasih jawaban random. Buat seru-seruan aja!_ 😄'
      );
    }

    const q = args.join(' ');
    // Deterministic: hash pertanyaan biar konsisten
    let hash = 0;
    for (let i = 0; i < q.length; i++) hash = (hash << 5) - hash + q.charCodeAt(i);
    const pick = Math.abs(hash) % 15;

    let jawaban, warna;
    if (pick < 5) { jawaban = JAWABAN_YES[pick]; warna = '🟢'; }
    else if (pick < 10) { jawaban = JAWABAN_NO[pick - 5]; warna = '🔴'; }
    else { jawaban = JAWABAN_MUNGKIN[pick - 10]; warna = '🟡'; }

    await sendMessage(from,
      `🔮 *ORACLE*\n\n` +
      `❓ ${q}\n\n` +
      `${warna} *${jawaban}*`
    );
  },
};
