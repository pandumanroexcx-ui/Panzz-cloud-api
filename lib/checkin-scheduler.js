const db = require('./db');
const { sendMessage } = require('./send-message');

const CHECKIN_MSG = [
  'Eh, apa kabar nih? Udah lama ga ngobrol 😊',
  'Halo! Lagi ngapain?',
  'Hei, gimana hari ini? Semoga lancar ya',
  'Kangen ngobrol nih. Gimana kabar?',
  'Eh, kamu masih inget aku ga? 😅',
  'Lagi sibuk ga? Kalau sempet, cerita dong',
];

const stmtLastCheckin = db.prepare(`
  SELECT last_checkin FROM user_checkin WHERE user_id = ?
`);
const stmtUpsertCheckin = db.prepare(`
  INSERT INTO user_checkin (user_id, last_checkin, total_checkins)
  VALUES (?, ?, 1)
  ON CONFLICT(user_id) DO UPDATE SET last_checkin = excluded.last_checkin, total_checkins = total_checkins + 1
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS user_checkin (
    user_id TEXT PRIMARY KEY,
    last_checkin INTEGER,
    total_checkins INTEGER DEFAULT 0
  );
`);

const stmtGetLastCheckin = db.prepare('SELECT last_checkin FROM user_checkin WHERE user_id = ?');
const stmtInsertCheckin = db.prepare(`
  INSERT INTO user_checkin (user_id, last_checkin, total_checkins)
  VALUES (?, ?, 1)
  ON CONFLICT(user_id) DO UPDATE SET last_checkin = excluded.last_checkin, total_checkins = total_checkins + 1
`);
const stmtActiveUsers = db.prepare('SELECT user_id, last_chat FROM user_activity WHERE last_chat > ?');

function startCheckinScheduler() {
  setInterval(async () => {
    try {
      const now = Date.now();
      // User yang last chat 3-7 hari lalu
      const users = stmtActiveUsers.all(now - 7 * 86400000);

      for (const u of users) {
        const daysSince = (now - u.last_chat) / 86400000;
        if (daysSince < 3) continue; // Skip kalau baru chat

        // Cek kapan terakhir check-in
        const last = stmtGetLastCheckin.get(u.user_id);
        if (last?.last_checkin && now - last.last_checkin < 3 * 86400000) continue;

        // Random 20% chance tiap cek (biar gak spam)
        if (Math.random() > 0.2) continue;

        try {
          const msg = CHECKIN_MSG[Math.floor(Math.random() * CHECKIN_MSG.length)];
          await sendMessage(u.user_id, msg);
          stmtInsertCheckin.run(u.user_id, now);
          console.log(`[CHECKIN] → ${u.user_id} (${Math.floor(daysSince)} hari)`);
        } catch (e) {}
        await new Promise(r => setTimeout(r, 3000));
      }
    } catch (e) {
      console.error('[CHECKIN] error:', e.message);
    }
  }, 30 * 60 * 1000); // Cek tiap 30 menit
}

module.exports = { startCheckinScheduler };
