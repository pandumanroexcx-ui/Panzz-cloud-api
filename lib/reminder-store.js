const db = require('./db');
const { sendMessage } = require('./send-message');

const stmtInsert = db.prepare(
  'INSERT INTO reminders (user_id, fire_at, text, created_at) VALUES (?, ?, ?, ?)'
);
const stmtGetPending = db.prepare(
  'SELECT * FROM reminders WHERE sent = 0 AND fire_at <= ? ORDER BY fire_at ASC'
);
const stmtMarkSent = db.prepare('UPDATE reminders SET sent = 1 WHERE id = ?');
const stmtGetUserReminders = db.prepare(
  'SELECT * FROM reminders WHERE user_id = ? AND sent = 0 ORDER BY fire_at ASC'
);

function addReminder(userId, delayMs, text) {
  const fireAt = Date.now() + delayMs;
  const info = stmtInsert.run(userId, fireAt, text, Date.now());
  return { id: info.lastInsertRowid, fireAt };
}

function getUserReminders(userId) {
  return stmtGetUserReminders.all(userId);
}

function startReminderWorker() {
  setInterval(async () => {
    try {
      const pending = stmtGetPending.all(Date.now());
      for (const r of pending) {
        try {
          await sendMessage(r.user_id, `⏰ *REMINDER!*\n\n${r.text}`);
          stmtMarkSent.run(r.id);
          console.log(`[REMINDER] sent to ${r.user_id}`);
        } catch (e) {
          console.error(`[REMINDER] gagal kirim:`, e.message);
        }
      }
    } catch (e) {
      console.error('[REMINDER] worker error:', e.message);
    }
  }, 30000);
}

module.exports = { addReminder, getUserReminders, startReminderWorker };
