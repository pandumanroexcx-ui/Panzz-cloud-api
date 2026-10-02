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

  CREATE TABLE IF NOT EXISTS daily_routines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL, hour INTEGER NOT NULL, minute INTEGER NOT NULL,
    text TEXT NOT NULL, last_sent_date TEXT, created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS finance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL, type TEXT NOT NULL, amount INTEGER NOT NULL,
    category TEXT, note TEXT, date_str TEXT NOT NULL, created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL, text TEXT NOT NULL, done INTEGER DEFAULT 0, created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL, created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL, name TEXT NOT NULL, created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS habit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL, date_str TEXT NOT NULL, created_at INTEGER NOT NULL,
    UNIQUE(habit_id, date_str)
  );

  CREATE TABLE IF NOT EXISTS shoplist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL, item TEXT NOT NULL, qty TEXT,
    done INTEGER DEFAULT 0, created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS countdowns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL, title TEXT NOT NULL, target_date TEXT NOT NULL, created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL, title TEXT NOT NULL, url TEXT NOT NULL, tag TEXT, created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS diary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL, mood TEXT, content TEXT NOT NULL, date_str TEXT NOT NULL, created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bucketlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL, text TEXT NOT NULL, target_date TEXT,
    done INTEGER DEFAULT 0, created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS water_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL, amount_ml INTEGER NOT NULL,
    date_str TEXT NOT NULL, created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS mood_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL, mood TEXT NOT NULL, note TEXT,
    date_str TEXT NOT NULL, created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS birthdays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL, name TEXT NOT NULL, date_str TEXT NOT NULL, created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS watchlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL, title TEXT NOT NULL, status TEXT DEFAULT 'todo', created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS celengan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL, nama TEXT NOT NULL, target INTEGER DEFAULT 0,
    saldo INTEGER DEFAULT 0, created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_memory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL,
    updated_at INTEGER NOT NULL, UNIQUE(user_id, key)
  );

  CREATE TABLE IF NOT EXISTS user_activity (
    user_id TEXT PRIMARY KEY,
    first_chat INTEGER, last_chat INTEGER,
    total_messages INTEGER DEFAULT 0, total_days INTEGER DEFAULT 0,
    last_date TEXT, streak INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS greeting_sent (
    user_id TEXT NOT NULL, type TEXT NOT NULL, date_str TEXT NOT NULL,
    UNIQUE(user_id, type, date_str)
  );

  CREATE TABLE IF NOT EXISTS user_checkin (
    user_id TEXT PRIMARY KEY, last_checkin INTEGER, total_checkins INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS inside_jokes (
    id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, text TEXT NOT NULL, created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS journal_prompts (
    id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, prompt TEXT NOT NULL,
    date_str TEXT NOT NULL, created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS pets (
    user_id TEXT PRIMARY KEY,
    nama TEXT NOT NULL, jenis TEXT NOT NULL,
    hunger INTEGER DEFAULT 100, happiness INTEGER DEFAULT 100, energy INTEGER DEFAULT 100,
    level INTEGER DEFAULT 1, exp INTEGER DEFAULT 0,
    last_fed INTEGER, last_played INTEGER, last_slept INTEGER,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS time_capsules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL, pesan TEXT NOT NULL, buka_at INTEGER NOT NULL,
    terbuka INTEGER DEFAULT 0, created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS curhat_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL, curhat TEXT NOT NULL, balasan TEXT NOT NULL,
    mood TEXT, created_at INTEGER NOT NULL
  );
`);

console.log('[DB] SQLite siap di', path.join(DB_DIR, 'panzz.db'));

module.exports = db;
