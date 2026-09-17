const db = require('../../lib/db');
const { setPending, getPending, clearPending } = require('../../lib/pending-downloads');

const stmtAdd = db.prepare('INSERT INTO diary (user_id, mood, content, date_str, created_at) VALUES (?, ?, ?, ?, ?)');
const stmtList = db.prepare('SELECT id, mood, date_str, created_at, substr(content, 1, 80) as preview FROM diary WHERE user_id = ? ORDER BY id DESC LIMIT 20');
const stmtGet = db.prepare('SELECT * FROM diary WHERE id = ? AND user_id = ?');
const stmtByDate = db.prepare('SELECT * FROM diary WHERE user_id = ? AND date_str = ? ORDER BY id DESC');
const stmtDel = db.prepare('DELETE FROM diary WHERE id = ? AND user_id = ?');
const stmtReset = db.prepare('DELETE FROM diary WHERE user_id = ?');

const MOOD_EMOJI = {
  senang: '😊', happy: '😊', sedih: '😢', sad: '😢',
  marah: '😠', angry: '😠', capek: '😩', tired: '😩',
  biasa: '😐', netral: '😐', semangat: '🔥', excited: '🔥',
  bingung: '🤔', cemas: '😰', cinta: '❤️',
};

function getTodayWIB() {
  const now = new Date();
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return wib.toISOString().slice(0, 10);
}

module.exports = {
  name: 'diary',
  alias: ['jurnal', 'curhat'],
  category: 'tools',
  description: 'Catatan harian dengan mood',

  async run({ from, args, sendMessage, message }) {
    const sub = (args?.[0] || '').toLowerCase();

    const pendingReset = getPending(`resetdiary:${from}`);
    if (pendingReset) {
      const jawab = (message?.text?.body || '').trim().toUpperCase();
      if (jawab === 'Y' || jawab === 'YA') {
        clearPending(`resetdiary:${from}`);
        const n = stmtReset.run(from).changes;
        return sendMessage(from, `✅ ${n} diary dihapus.`);
      } else if (jawab === 'N' || jawab === 'NO' || jawab === 'BATAL') {
        clearPending(`resetdiary:${from}`);
        return sendMessage(from, '✅ Dibatalkan.');
      }
      return sendMessage(from, 'Ketik *Y* / *N*.');
    }

    if (!sub || sub === 'help') {
      return sendMessage(from,
        '📔 *DIARY*\n\n' +
        '• `diary tulis Hari ini menyenangkan | senang` — tulis diary\n' +
        '• `diary list` — lihat semua\n' +
        '• `diary lihat 1` — buka diary\n' +
        '• `diary hari-ini` — diary hari ini\n' +
        '• `diary hapus 1` — hapus\n' +
        '• `diary reset` — hapus semua\n\n' +
        '*Mood:* senang, sedih, marah, capek, biasa, semangat, bingung, cemas'
      );
    }

    if (sub === 'tulis' || sub === 'add' || sub === 'tambah') {
      const raw = args.slice(1).join(' ').trim();
      if (!raw) return sendMessage(from, '❌ Format: `diary tulis <isi> | <mood>`\nContoh: `diary tulis Hari ini seru banget | senang`');

      const parts = raw.split('|').map(s => s.trim());
      const content = parts[0];
      const moodRaw = (parts[1] || '').toLowerCase();
      const mood = moodRaw || null;

      if (!content || content.length < 3) return sendMessage(from, '❌ Isi diary minimal 3 karakter.');
      if (content.length > 3000) return sendMessage(from, '❌ Isi max 3000 karakter.');

      const today = getTodayWIB();
      stmtAdd.run(from, mood, content, today, Date.now());
      const moodEmoji = mood ? (MOOD_EMOJI[mood] || '📝') : '📝';
      return sendMessage(from, `${moodEmoji} Diary tersimpan!\n\n📅 ${today}${mood ? `\n😊 Mood: ${mood}` : ''}`);
    }

    if (sub === 'list' || sub === 'ls') {
      const list = stmtList.all(from);
      if (!list.length) return sendMessage(from, '📭 Belum ada diary. Tulis: `diary tulis <isi> | <mood>`');
      const lines = list.map(d => {
        const emoji = d.mood ? (MOOD_EMOJI[d.mood] || '📝') : '📝';
        return `${emoji} *${d.id}.* ${d.date_str}\n    _${d.preview}..._`;
      });
      return sendMessage(from, `📔 *DIARY KAMU (${list.length})*\n\n${lines.join('\n\n')}`);
    }

    if (sub === 'lihat' || sub === 'view' || sub === 'get') {
      const id = parseInt(args?.[1], 10);
      if (isNaN(id)) return sendMessage(from, '❌ Format: `diary lihat <id>`');
      const d = stmtGet.get(id, from);
      if (!d) return sendMessage(from, `❌ Diary #${id} gak ketemu.`);
      const emoji = d.mood ? (MOOD_EMOJI[d.mood] || '📝') : '📝';
      return sendMessage(from, `${emoji} *DIARY ${d.date_str}*\n${d.mood ? `😊 Mood: ${d.mood}\n` : ''}\n${d.content}`);
    }

    if (sub === 'hari-ini' || sub === 'today') {
      const today = getTodayWIB();
      const list = stmtByDate.all(from, today);
      if (!list.length) return sendMessage(from, `📭 Belum ada diary hari ini (${today}).`);
      const lines = list.map(d => {
        const emoji = d.mood ? (MOOD_EMOJI[d.mood] || '📝') : '📝';
        return `${emoji} *${d.id}.* ${d.content}`;
      });
      return sendMessage(from, `📔 *DIARY ${today}*\n\n${lines.join('\n\n')}`);
    }

    if (sub === 'hapus' || sub === 'del' || sub === 'delete') {
      const id = parseInt(args?.[1], 10);
      if (isNaN(id)) return sendMessage(from, '❌ Format: `diary hapus <id>`');
      const ok = stmtDel.run(id, from).changes > 0;
      return sendMessage(from, ok ? `✅ Diary #${id} dihapus.` : `❌ Gak ketemu.`);
    }

    if (sub === 'reset') {
      setPending(`resetdiary:${from}`, {});
      return sendMessage(from, '⚠️ Hapus semua diary? Ketik *Y* / *N*.');
    }

    return sendMessage(from, `❌ Sub-command *${sub}* gak ada. Ketik \`diary help\``);
  },
};
