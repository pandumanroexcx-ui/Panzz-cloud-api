const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(path.join(DB_DIR, 'panzz.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL, role TEXT NOT NULL, content TEXT NOT NULL, created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_history(user_id, id);

  CREATE TABLE IF NOT EXISTS confess_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender TEXT NOT NULL, target TEXT NOT NULL, target_name TEXT NOT NULL,
    initials TEXT NOT NULL, message TEXT NOT NULL, created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL, fire_at INTEGER NOT NULL, text TEXT NOT NULL,
    sent INTEGER DEFAULT 0, created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_reminder_fire ON reminders(fire_at, sent);

  CREATE TABLE IF NOT EXISTS daily_routines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL, hour INTEGER NOT NULL, minute INTEGER NOT NULL,
    text TEXT NOT NULL, last_sent_date TEXT, created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_routine_user ON daily_routines(user_id);

  -- 💰 Finance
  CREATE TABLE IF NOT EXISTS finance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    category TEXT,
    note TEXT,
    date_str TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_finance_user ON finance(user_id, date_str);

  -- ✅ To-Do
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    text TEXT NOT NULL,
    done INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_todo_user ON todos(user_id, done);

  -- 📒 Notes
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_note_user ON notes(user_id);
`);

console.log('[DB] SQLite siap di', path.join(DB_DIR, 'panzz.db'));

module.exports = db;
