const db = require('./db');

db.exec(`

const stmtGet = db.prepare('SELECT * FROM user_activity WHERE user_id = ?');
const stmtInsert = db.prepare('INSERT INTO user_activity (user_id, first_chat, last_chat, total_messages, total_days, last_date, streak) VALUES (?, ?, ?, 1, 1, ?, 1)');
const stmtUpdate = db.prepare('UPDATE user_activity SET last_chat = ?, total_messages = total_messages + 1 WHERE user_id = ?');
const stmtStreak = db.prepare('UPDATE user_activity SET streak = ?, total_days = total_days + 1, last_date = ? WHERE user_id = ?');
const stmtResetStreak = db.prepare('UPDATE user_activity SET streak = 1, total_days = total_days + 1, last_date = ? WHERE user_id = ?');

function getTodayWIB() {
  const now = new Date();
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return wib.toISOString().slice(0, 10);
}

function getYesterdayWIB() {
  const now = new Date();
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000 - 86400000);
  return wib.toISOString().slice(0, 10);
}

function track(userId) {
  const today = getTodayWIB();
  const yesterday = getYesterdayWIB();
  const existing = stmtGet.get(userId);

  if (!existing) {
    stmtInsert.run(userId, Date.now(), Date.now(), today);
    return { isNew: true, streak: 1 };
  }

  stmtUpdate.run(Date.now(), userId);

  // Cek streak
  if (existing.last_date === today) {
    // Udah chat hari ini, gak nambah streak
  } else if (existing.last_date === yesterday) {
    // Lanjut streak
    stmtStreak.run(existing.streak + 1, today, userId);
  } else {
    // Reset streak (bolong sehari)
    stmtResetStreak.run(today, userId);
  }

  return { isNew: false };
}

function getStats(userId) {
  const row = stmtGet.get(userId);
  if (!row) return null;

  const lastChatMs = Date.now() - row.last_chat;
  const daysSince = Math.floor(lastChatMs / 86400000);

  return {
    firstChat: row.first_chat,
    lastChat: row.last_chat,
    totalMessages: row.total_messages,
    totalDays: row.total_days,
    streak: row.streak,
    daysSince,
    lastDate: row.last_date,
  };
}

function getDaysSinceLastChat(userId) {
  const row = stmtGet.get(userId);
  if (!row) return null;
  return Math.floor((Date.now() - row.last_chat) / 86400000);
}

module.exports = { track, getStats, getDaysSinceLastChat, getTodayWIB };
