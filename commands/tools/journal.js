const { GROQ_KEY_TOOLS, GROQ_API_KEY } = require('../../config');
const { callGroq } = require('../../lib/groq');
const db = require('../../lib/db');

db.exec(`
  CREATE TABLE IF NOT EXISTS journal_prompts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    prompt TEXT NOT NULL,
    date_str TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
`);

const stmtInsert = db.prepare('INSERT INTO journal_prompts (user_id, prompt, date_str, created_at) VALUES (?, ?, ?, ?)');
const stmtToday = db.prepare('SELECT * FROM journal_prompts WHERE user_id = ? AND date_str = ?');
const stmtRecent = db.prepare('SELECT * FROM journal_prompts WHERE user_id = ? ORDER BY id DESC LIMIT 7');

function getTodayWIB() {
  const now = new Date();
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return wib.toISOString().slice(0, 10);
}

const KATEGORI = ['syukur', 'refleksi', 'cita-cita', 'momen', 'perasaan', 'kebaikan'];

module.exports = {
  name: 'journal',
  alias: ['jurnal', 'renunganharian'],
  category: 'tools',
  description: 'Prompt journaling harian',

  async run({ from, args, sendMessage }) {
    const sub = (args?.[0] || '').toLowerCase();

    if (sub === 'riwayat' || sub === 'history') {
      const list = stmtRecent.all(from);
      if (!list.length) return sendMessage(from, '📔 Belum ada journal prompt.');
      const lines = list.map(j => `📅 ${j.date_str}\n_"${j.prompt}"_`).join('\n\n');
      return sendMessage(from, `📔 *RIWAYAT JOURNAL*\n\n${lines}`);
    }

    // Cek prompt hari ini
    const today = getTodayWIB();
    const existing = stmtToday.get(from, today);

    if (existing) {
      return sendMessage(from,
        `📔 *JOURNAL PROMPT HARI INI*\n\n_"${existing.prompt}"_\n\n` +
        `_Jawab di diary atau renungin aja._ ✍️`
      );
    }

    await sendMessage(from, '✍️ Lagi bikin prompt...');

    try {
      const apiKey = GROQ_KEY_TOOLS || GROQ_API_KEY;
      const kategori = KATEGORI[Math.floor(Math.random() * KATEGORI.length)];

      const prompt = `Bikin 1 pertanyaan journaling untuk kategori "${kategori}" dalam bahasa Indonesia.

Aturan:
- Pertanyaan terbuka, bikin mikir
- Personal, menyentuh
- Max 1 kalimat
- Jangan pakai pembuka
- Langsung pertanyaannya aja`;

      const result = await callGroq({ apiKey, prompt });
      const clean = result.replace(/^["']|["']$/g, '').trim();

      stmtInsert.run(from, clean, today, Date.now());

      await sendMessage(from,
        `📔 *JOURNAL PROMPT HARI INI*\n\n_"${clean}"_\n\n` +
        `_Jawab di diary atau renungin aja._ ✍️\n\n` +
        `_Ketik \`journal riwayat\` buat liat prompt kemarin._`
      );
    } catch (e) {
      console.error('[JOURNAL]', e.message);
      await sendMessage(from, '⚠️ Gagal bikin prompt, coba lagi 🙏');
    }
  },
};
