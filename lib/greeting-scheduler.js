const db = require('./db');
const { sendMessage } = require('./send-message');

db.exec(`

const stmtInsert = db.prepare('INSERT OR IGNORE INTO greeting_sent (user_id, type, date_str) VALUES (?, ?, ?)');
const stmtCheck = db.prepare('SELECT 1 FROM greeting_sent WHERE user_id = ? AND type = ? AND date_str = ?');
const stmtActiveUsers = db.prepare(`
  SELECT user_id FROM user_activity
  WHERE last_chat > ?
`);

const MORNING_HOURS = [7, 8, 9];
const NIGHT_HOURS = [21, 22, 23];

const MORNING_MSG = [
  '🌅 Selamat pagi! Gimana tidurnya semalam?',
  '☀️ Pagi! Hari ini mau ngapain?',
  '🌅 Good morning! Jangan lupa sarapan ya.',
  '☕ Pagi! Udah minum kopi belum?',
];
const NIGHT_MSG = [
  '🌙 Selamat malam. Gimana hari ini?',
  '✨ Malam. Jangan lupa istirahat ya.',
  '🌙 Udah ngantuk belum? Jangan lupa tidur cukup.',
  '💤 Good night! Semoga mimpi indah.',
];

function getTodayWIB() {
  const now = new Date();
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return wib.toISOString().slice(0, 10);
}

function getWIBAHour() {
  const now = new Date();
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return wib.getUTCHours();
}

function startGreetingScheduler() {
  // Cek tiap 5 menit
  setInterval(async () => {
    try {
      const hour = getWIBAHour();
      const today = getTodayWIB();
      const isMorning = MORNING_HOURS.includes(hour);
      const isNight = NIGHT_HOURS.includes(hour);

      if (!isMorning && !isNight) return;

      const type = isMorning ? 'morning' : 'night';
      const messages = isMorning ? MORNING_MSG : NIGHT_MSG;

      // Ambil user aktif (24 jam terakhir)
      const activeUsers = stmtActiveUsers.all(Date.now() - 24 * 3600000);

      for (const u of activeUsers) {
        // Skip kalau udah dikirim hari ini
        if (stmtCheck.get(u.user_id, type, today)) continue;

        try {
          const msg = messages[Math.floor(Math.random() * messages.length)];
          await sendMessage(u.user_id, msg);
          stmtInsert.run(u.user_id, type, today);
          console.log(`[GREETING] ${type} → ${u.user_id}`);
        } catch (e) {
          console.error(`[GREETING] gagal ${u.user_id}:`, e.message);
        }
        // Delay biar gak kena rate limit
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (e) {
      console.error('[GREETING] scheduler error:', e.message);
    }
  }, 5 * 60 * 1000);
}

module.exports = { startGreetingScheduler };
