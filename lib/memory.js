const db = require('./db');

// Pastiin tabel ada
db.exec(`
  CREATE TABLE IF NOT EXISTS user_memory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL,
    UNIQUE(user_id, key)
  );
  CREATE INDEX IF NOT EXISTS idx_memory_user ON user_memory(user_id);
`);

const stmtSet = db.prepare(`
  INSERT INTO user_memory (user_id, key, value, updated_at)
  VALUES (?, ?, ?, ?)
  ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
`);

const stmtGet = db.prepare('SELECT key, value FROM user_memory WHERE user_id = ?');
const stmtGetOne = db.prepare('SELECT value FROM user_memory WHERE user_id = ? AND key = ?');
const stmtDel = db.prepare('DELETE FROM user_memory WHERE user_id = ? AND key = ?');
const stmtReset = db.prepare('DELETE FROM user_memory WHERE user_id = ?');

function setMemory(userId, key, value) {
  stmtSet.run(userId, key.toLowerCase(), String(value), Date.now());
}

function getMemory(userId) {
  const rows = stmtGet.all(userId);
  const obj = {};
  for (const r of rows) obj[r.key] = r.value;
  return obj;
}

function getOne(userId, key) {
  const row = stmtGetOne.get(userId, key.toLowerCase());
  return row ? row.value : null;
}

function deleteMemory(userId, key) {
  return stmtDel.run(userId, key.toLowerCase()).changes > 0;
}

function resetMemory(userId) {
  return stmtReset.run(userId).changes;
}

module.exports = { setMemory, getMemory, getOne, deleteMemory, resetMemory };
