module.exports = {
  name: 'count',
  alias: ['hitung', 'wordcount'],
  category: 'tools',
  description: 'Hitung kata, karakter, kalimat',

  async run({ from, args, sendMessage, message }) {
    const text = args?.join(' ') || message?.text?.body?.replace(/^\.?count\s*/i, '') || '';

    if (!text || text.length < 1) {
      return sendMessage(from, '📝 Format: count <teks>\n\nContoh:\ncount Saya suka makan nasi goreng');
    }

    const words = text.trim().split(/\s+/).filter(Boolean);
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0).length;
    const readingTime = Math.ceil(words.length / 200);

    await sendMessage(from,
      `📊 *STATISTIK TEKS*\n\n` +
      `📝 Kata: *${words.length}*\n` +
      `🔤 Karakter: *${chars}* (tanpa spasi: ${charsNoSpace})\n` +
      `📖 Kalimat: *${sentences}*\n` +
      `📄 Paragraf: *${paragraphs}*\n` +
      `⏱️ Estimasi baca: *${readingTime} menit*`
    );
  },
};
