const db = require('../../lib/db');
const { setPending, getPending, clearPending } = require('../../lib/pending-downloads');

const stmtAdd = db.prepare('INSERT INTO mood_logs (user_id, mood, note, date_str, created_at) VALUES (?, ?, ?, ?, ?)');
const stmtToday = db.prepare('SELECT * FROM mood_logs WHERE user_id = ? AND date_str = ? ORDER BY id DESC');
const stmtLast30 = db.prepare('SELECT mood, COUNT(*) as count FROM mood_logs WHERE user_id = ? AND date_str >= ? GROUP BY mood ORDER BY count DESC');
const stmtRecent = db.prepare('SELECT * FROM mood_logs WHERE user_id = ? ORDER BY id DESC LIMIT 10');
const stmtReset = db.prepare('DELETE FROM mood_logs WHERE user_id = ?');

const MOOD_EMOJI = {
  senang: '😊', bahagia: '😄', sedih: '😢', marah: '😠',
  capek: '😩', biasa: '😐', semangat: '🔥', bingung: '🤔',
  cemas: '😰', cinta: '❤️', kesepian: '🥺', tenang: '😌',
  stres: '😫', bersyukur: '🙏', kacau: '😵',
};

function getTodayWIB() {
  const now = new Date();
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return wib.toISOString().slice(0, 10);
}

module.exports = {
  name: 'mood',
  alias: ['perasaan', 'suasana'],
  category: 'tools',
  description: 'Tracker mood harian',

  async run({ from, args, sendMessage, message }) {
    const sub = (args?.[0] || '').toLowerCase();

    const pendingReset = getPending(`resetmood:${from}`);
    if (pendingReset) {
      const jawab = (message?.text?.body || '').trim().toUpperCase();
      if (jawab === 'Y' || jawab === 'YA') {
        clearPending(`resetmood:${from}`);
        const n = stmtReset.run(from).changes;
        return sendMessage(from, `✅ ${n} log mood dihapus.`);
      } else if (jawab === 'N' || jawab === 'NO' || jawab === 'BATAL') {
        clearPending(`resetmood:${from}`);
        return sendMessage(from, '✅ Dibatalkan.');
      }
      return sendMessage(from, 'Ketik *Y* / *N*.');
    }

    if (!sub || sub === 'help') {
      return sendMessage(from,
        '😊 *MOOD TRACKER*\n\n' +
        '• `mood senang` — catat mood\n' +
        '• `mood sedih hari ini aku galau` — dengan catatan\n' +
        '• `mood hari-ini` — mood hari ini\n' +
        '• `mood stats` — statistik 30 hari\n' +
        '• `mood riwayat` — 10 terakhir\n' +
        '• `mood reset` — hapus semua\n\n' +
        '*Mood tersedia:*\n' +
        'senang, bahagia, sedih, marah, capek, biasa, semangat, bingung, cemas, cinta, kesepian, tenang, stres, bersyukur, kacau'
      );
    }

    if (sub === 'hari-ini' || sub === 'today') {
      const today = getTodayWIB();
      const list = stmtToday.all(from, today);
      if (!list.length) return sendMessage(from, `📭 Belum ada log mood hari ini.`);
      const lines = list.map(m => {
        const emoji = MOOD_EMOJI[m.mood] || '📝';
        return `${emoji} *${m.mood}*${m.note ? `\n    _${m.note}_` : ''}`;
      });
      return sendMessage(from, `😊 *MOOD HARI INI (${today})*\n\n${lines.join('\n\n')}`);
    }

    if (sub === 'stats' || sub === 'statistik') {
      const thirtyDaysAgo = new Date(Date.now() + 7*60*60*1000 - 30*86400000).toISOString().slice(0, 10);
      const rows = stmtLast30.all(from, thirtyDaysAgo);
      if (!rows.length) return sendMessage(from, '📭 Belum ada log mood 30 hari terakhir.');

      const total = rows.reduce((s, r) => s + r.count, 0);
      const lines = rows.slice(0, 8).map(r => {
        const emoji = MOOD_EMOJI[r.mood] || '📝';
        const persen = Math.round((r.count / total) * 100);
        const bar = '█'.repeat(Math.round(persen / 5)) + '░'.repeat(20 - Math.round(persen / 5));
        return `${emoji} ${r.mood} ${bar} ${persen}% (${r.count}x)`;
      });

      return sendMessage(from, `📊 *STATISTIK MOOD (30 hari)*\n\n${lines.join('\n')}\n\nTotal: ${total} log`);
    }

    if (sub === 'riwayat' || sub === 'history') {
      const rows = stmtRecent.all(from);
      if (!rows.length) return sendMessage(from, '📭 Belum ada log mood.');
      const lines = rows.map(r => {
        const emoji = MOOD_EMOJI[r.mood] || '📝';
        return `${emoji} ${r.date_str} — ${r.mood}${r.note ? `\n    _${r.note}_` : ''}`;
      });
      return sendMessage(from, `📋 *10 MOOD TERAKHIR*\n\n${lines.join('\n\n')}`);
    }

    if (sub === 'reset') {
      setPending(`resetmood:${from}`, {});
      return sendMessage(from, '⚠️ Hapus semua log mood? Ketik *Y* / *N*.');
    }

    // Catat mood
    const mood = sub;
    const note = args.slice(1).join(' ').trim() || null;
    if (!mood || mood.length > 30) return sendMessage(from, '❌ Mood max 30 karakter.');

    const today = getTodayWIB();
    stmtAdd.run(from, mood, note, today, Date.now());
    const emoji = MOOD_EMOJI[mood] || '📝';
    return sendMessage(from, `${emoji} Mood *${mood}* dicatat!${note ? `\n📝 _${note}_` : ''}`);
  },
};
