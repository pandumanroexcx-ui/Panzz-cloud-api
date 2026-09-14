const db = require('./db');

const MAX_HISTORY = 20;

const stmtInsert = db.prepare(
  'INSERT INTO chat_history (user_id, role, content, created_at) VALUES (?, ?, ?, ?)'
);
const stmtGet = db.prepare(
  'SELECT role, content FROM chat_history WHERE user_id = ? ORDER BY id DESC LIMIT ?'
);
const stmtClear = db.prepare('DELETE FROM chat_history WHERE user_id = ?');
const stmtCount = db.prepare('SELECT COUNT(*) as total FROM chat_history WHERE user_id = ?');

function getHistory(userId) {
  const rows = stmtGet.all(userId, MAX_HISTORY);
  return rows.reverse();
}

function addMessage(userId, role, content) {
  stmtInsert.run(userId, role, content, Date.now());
}

function clearHistory(userId) {
  stmtClear.run(userId);
}

function getTotalMessages(userId) {
  return stmtCount.get(userId)?.total || 0;
}

module.exports = { getHistory, addMessage, clearHistory, getTotalMessages };
