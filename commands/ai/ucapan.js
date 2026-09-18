const { GROQ_KEY_TOOLS, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');

module.exports = {
  name: 'ucapan',
  alias: ['ucap', 'greeting'],
  category: 'ai',
  description: 'Bikin ucapan otomatis (ultah, nikah, dll)',

  async run({ from, args, sendMessage }) {
    if (args?.length < 2) {
      return sendMessage(from,
        '🎉 *UCAPAN OTOMATIS*\n\n' +
        '*Format:* `ucapan <jenis> <nama/tujuan>`\n\n' +
        '*Contoh:*\n' +
        '• `ucapan ultah Andi`\n' +
        '• `ucapan nikah Budi & Sari`\n' +
        '• `ucapan anniversary pasangan`\n' +
        '• `ucapan wisuda Rina`\n' +
        '• `ucapan lebaran keluarga`\n' +
        '• `ucapan kelahiran baby`\n' +
        '• `ucapan pindah rumah`\n' +
        '• `ucapan promosi jabatan`\n\n' +
        '_Bot kasih 2 versi: formal & santai._'
      );
    }

    const jenis = args[0].toLowerCase();
    const target = args.slice(1).join(' ');

    await sendMessage(from, '🎉 Lagi bikin ucapan...');

    try {
      const apiKey = GROQ_KEY_TOOLS || GROQ_API_KEY;
      const prompt = `Bikin 2 versi ucapan ${jenis} untuk: ${target}

Format:

*📝 VERSI FORMAL:*
[ucapan formal, sopan, 2-3 baris]

*😎 VERSI SANTAI:*
[ucapan santai, kekinian, boleh emoji, 2-3 baris]

Aturan:
- Bahasa Indonesia
- Menyentuh & tulus
- Jangan pakai pembuka penjelasan
- Max 3 baris per versi`;

      const result = await callGroq({ apiKey, prompt });
      await sendMessage(from, `🎉 *UCAPAN ${jenis.toUpperCase()} — ${target}*\n\n${result}`);
    } catch (e) {
      console.error('[UCAPAN]', e.message);
      await sendMessage(from, '⚠️ Gagal, coba lagi 🙏');
    }
  },
};
