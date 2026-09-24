const db = require('../../lib/db');
const { setPending, getPending, clearPending } = require('../../lib/pending-downloads');

const stmtAdd = db.prepare('INSERT INTO watchlists (user_id, title, status, created_at) VALUES (?, ?, ?, ?)');
const stmtList = db.prepare('SELECT * FROM watchlists WHERE user_id = ? ORDER BY status ASC, id DESC');
const stmtDone = db.prepare('UPDATE watchlists SET status = ? WHERE id = ? AND user_id = ?');
const stmtDel = db.prepare('DELETE FROM watchlists WHERE id = ? AND user_id = ?');
const stmtReset = db.prepare('DELETE FROM watchlists WHERE user_id = ?');

module.exports = {
  name: 'watchlist',
  alias: ['filmku', 'nontonlist'],
  category: 'tools',
  description: 'Tracker film/series mau ditonton',

  async run({ from, args, sendMessage, message }) {
    const sub = (args?.[0] || '').toLowerCase();

    const pendingReset = getPending(`resetwl:${from}`);
    if (pendingReset) {
      const jawab = (message?.text?.body || '').trim().toUpperCase();
      if (jawab === 'Y' || jawab === 'YA') {
        clearPending(`resetwl:${from}`);
        const n = stmtReset.run(from).changes;
        return sendMessage(from, `✅ ${n} watchlist dihapus.`);
      } else if (jawab === 'N' || jawab === 'NO' || jawab === 'BATAL') {
        clearPending(`resetwl:${from}`);
        return sendMessage(from, '✅ Dibatalkan.');
      }
      return sendMessage(from, 'Ketik *Y* / *N*.');
    }

    if (!sub || sub === 'help') {
      return sendMessage(from,
        '🎬 *WATCHLIST*\n\n' +
        '• `watchlist add Inception` — tambah film\n' +
        '• `watchlist add Breaking Bad | series` — tambah series\n' +
        '• `watchlist list` — daftar\n' +
        '• `watchlist done 1` — tandai udah nonton\n' +
        '• `watchlist hapus 1` — hapus\n' +
        '• `watchlist reset` — hapus semua\n\n' +
        '_Status: 🎬 Mau Nonton, ✅ Udah Nonton_'
      );
    }

    if (sub === 'add' || sub === 'tambah') {
      const raw = args.slice(1).join(' ');
      if (!raw) return sendMessage(from, '❌ Format: `watchlist add <judul>`');

      const parts = raw.split('|').map(s => s.trim());
      const title = parts[0];
      const tipe = (parts[1] || 'film').toLowerCase();
      if (!title || title.length > 100) return sendMessage(from, '❌ Judul max 100 karakter.');

      stmtAdd.run(from, `${title} (${tipe})`, 'todo', Date.now());
      return sendMessage(from, `🎬 Ditambah ke watchlist:\n\n*${title}* (${tipe})`);
    }

    if (sub === 'list' || sub === 'ls') {
      const list = stmtList.all(from);
      if (!list.length) return sendMessage(from, '🎬 Watchlist kosong. Tambah: `watchlist add Inception`');

      const todo = list.filter(w => w.status === 'todo');
      const done = list.filter(w => w.status === 'done');

      let text = `🎬 *WATCHLIST*\n\n`;
      if (todo.length) {
        text += `📝 *Mau Nonton (${todo.length}):*\n`;
        for (const w of todo) text += `⬜ *${w.id}.* ${w.title}\n`;
      }
      if (done.length) {
        text += `\n✅ *Udah Nonton (${done.length}):*\n`;
        for (const w of done) text += `✅ ~${w.title}~\n`;
      }
      const progress = list.length ? Math.round((done.length / list.length) * 100) : 0;
      text += `\n📊 Progress: ${progress}%`;
      return sendMessage(from, text);
    }

    if (sub === 'done') {
      const id = parseInt(args?.[1], 10);
      if (isNaN(id)) return sendMessage(from, '❌ Format: `watchlist done <id>`');
      const ok = stmtDone.run('done', id, from).changes > 0;
      return sendMessage(from, ok ? `✅ Film #${id} ditandai udah nonton!` : `❌ Gak ketemu.`);
    }

    if (sub === 'undo') {
      const id = parseInt(args?.[1], 10);
      if (isNaN(id)) return sendMessage(from, '❌ Format: `watchlist undo <id>`');
      const ok = stmtDone.run('todo', id, from).changes > 0;
      return sendMessage(from, ok ? `↩️ Film #${id} dibalikin ke daftar.` : `❌ Gak ketemu.`);
    }

    if (sub === 'hapus' || sub === 'del' || sub === 'delete') {
      const id = parseInt(args?.[1], 10);
      if (isNaN(id)) return sendMessage(from, '❌ Format: `watchlist hapus <id>`');
      const ok = stmtDel.run(id, from).changes > 0;
      return sendMessage(from, ok ? `✅ Film #${id} dihapus.` : `❌ Gak ketemu.`);
    }

    if (sub === 'reset') {
      setPending(`resetwl:${from}`, {});
      return sendMessage(from, '⚠️ Hapus semua watchlist? Ketik *Y* / *N*.');
    }

    return sendMessage(from, `❌ Sub-command *${sub}* gak ada. Ketik \`watchlist help\`.`);
  },
};
