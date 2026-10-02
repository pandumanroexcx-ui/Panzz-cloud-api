const { GROQ_KEY_TOOLS, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');
const { setMemory, getMemory } = require('../../lib/memory');

const MOODS = {
  senang: { emoji: '😊', emoji2: '🎉', respon: 'ikut seneng' },
  sedih: { emoji: '😢', emoji2: '🤗', respon: 'empati + hibur' },
  marah: { emoji: '😠', emoji2: '😌', respon: 'tenangin + validasi' },
  capek: { emoji: '😩', emoji2: '💆', respon: 'kasih semangat + saran istirahat' },
  cemas: { emoji: '😰', emoji2: '🧘', respon: 'tenangin + teknik relaksasi' },
  semangat: { emoji: '🔥', emoji2: '🚀', respon: 'dukung + dorong' },
  biasa: { emoji: '😐', emoji2: '💭', respon: 'cari topik seru' },
  kesepian: { emoji: '🥺', emoji2: '🤝', respon: 'temani + hibur' },
};

module.exports = {
  name: 'moodsync',
  alias: ['moodku', 'suasanaku'],
  category: 'tools',
  description: 'Bot adaptasi mood kamu',

  async run({ from, args, sendMessage }) {
    const sub = (args?.[0] || '').toLowerCase();

    if (!sub || sub === 'help') {
      const list = Object.entries(MOODS).map(([k, v]) => `• ${v.emoji} ${k}`).join('\n');
      return sendMessage(from,
        '🎭 *MOOD SYNC*\n\n' +
        'Kasih tau bot mood kamu sekarang, bot bakal adaptasi responnya.\n\n' +
        '*Format:* `mood <mood>`\n\n' +
        '*Mood tersedia:*\n' + list + '\n\n' +
        '*Contoh:* `mood sedih`'
      );
    }

    if (!MOODS[sub]) {
      const list = Object.keys(MOODS).join(', ');
      return sendMessage(from, `❌ Mood *${sub}* gak ada.\n\n*Tersedia:* ${list}`);
    }

    const mood = MOODS[sub];
    setMemory(from, 'mood_terakhir', sub);

    await sendMessage(from, `${mood.emoji} Lagi nyesuain...`);

    try {
      const apiKey = GROQ_KEY_TOOLS || GROQ_API_KEY;
      const memory = getMemory(from);
      const nama = memory.nama || 'teman';

      const prompt = `Kamu adalah teman yang empatik.

User (${nama}) lagi ngerasa: ${sub}
Tugasmu: ${mood.respon}

Balas dengan pesan yang sesuai mood "${sub}". Kayak teman yang ngerti.

Aturan:
- Max 3-4 baris
- Bahasa santai
- Pake emoji ${mood.emoji} ${mood.emoji2}
- Jangan kaku/formal
- Kalau mood sedih/cemas/kesepian, validasi dulu perasaannya`;

      const result = await callGroq({ apiKey, prompt });
      await sendMessage(from, `${mood.emoji} *Aku ngerti...*\n\n${result}`);
    } catch (e) {
      console.error('[MOOD]', e.message);
      await sendMessage(from, '⚠️ Gagal, coba lagi 🙏');
    }
  },
};
