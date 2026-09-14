const db = require('./db');
const { sendMessage } = require('./send-message');

// Pastiin tabel ada (double check)
db.exec(`
  CREATE TABLE IF NOT EXISTS daily_routines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    hour INTEGER NOT NULL,
    minute INTEGER NOT NULL,
    text TEXT NOT NULL,
    last_sent_date TEXT,
    created_at INTEGER NOT NULL
  );
`);

const stmtInsert = db.prepare(
  'INSERT INTO daily_routines (user_id, hour, minute, text, created_at) VALUES (?, ?, ?, ?, ?)'
);
const stmtGetUser = db.prepare(
  'SELECT * FROM daily_routines WHERE user_id = ? ORDER BY hour, minute'
);
const stmtGetAll = db.prepare('SELECT * FROM daily_routines');
const stmtDelete = db.prepare('DELETE FROM daily_routines WHERE id = ? AND user_id = ?');
const stmtUpdateLastSent = db.prepare('UPDATE daily_routines SET last_sent_date = ? WHERE id = ?');

function addRoutine(userId, hour, minute, text) {
  const info = stmtInsert.run(userId, hour, minute, text, Date.now());
  return info.lastInsertRowid;
}

function getUserRoutines(userId) {
  return stmtGetUser.all(userId);
}

function deleteRoutine(userId, id) {
  return stmtDelete.run(id, userId).changes > 0;
}

function getWIB() {
  const now = new Date();
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return {
    hour: wib.getUTCHours(),
    minute: wib.getUTCMinutes(),
    dateStr: wib.toISOString().slice(0, 10),
  };
}

function startRoutineWorker() {
  setInterval(async () => {
    try {
      const { hour, minute, dateStr } = getWIB();
      const routines = stmtGetAll.all();
      for (const r of routines) {
        if (r.hour !== hour) continue;
        if (r.minute !== minute) continue;
        if (r.last_sent_date === dateStr) continue;

        try {
          await sendMessage(r.user_id, `⏰ *${r.text}*`);
          stmtUpdateLastSent.run(dateStr, r.id);
          console.log(`[ROUTINE] sent to ${r.user_id}: ${r.text} (WIB ${hour}:${minute})`);
        } catch (e) {
          console.error(`[ROUTINE] gagal kirim:`, e.message);
        }
      }
    } catch (e) {
      console.error('[ROUTINE] worker error:', e.message);
    }
  }, 30000);
}

module.exports = { addRoutine, getUserRoutines, deleteRoutine, startRoutineWorker };
