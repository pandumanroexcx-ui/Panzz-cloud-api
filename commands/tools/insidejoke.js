const db = require('../../lib/db');
const { setPending, getPending, clearPending } = require('../../lib/pending-downloads');

db.exec(`
  CREATE TABLE IF NOT EXISTS inside_jokes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
`);

const stmtAdd = db.prepare('INSERT INTO inside_jokes (user_id, text, created_at) VALUES (?, ?, ?)');
const stmtList = db.prepare('SELECT * FROM inside_jokes WHERE user_id = ? ORDER BY id DESC');
const stmtDel = db.prepare('DELETE FROM inside_jokes WHERE id = ? AND user_id = ?');
const stmtReset = db.prepare('DELETE FROM inside_jokes WHERE user_id = ?');

module.exports = {
  name: 'insidejoke',
  alias: ['joke', 'lelucon', 'jokepribadi'],
  category: 'tools',
  description: 'Simpen inside joke pribadi',

  async run({ from, args, sendMessage, message }) {
    const sub = (args?.[0] || '').toLowerCase();

    const pendingReset = getPending(`resetjoke:${from}`);
    if (pendingReset) {
      const jawab = (message?.text?.body || '').trim().toUpperCase();
      if (jawab === 'Y' || jawab === 'YA') {
        clearPending(`resetjoke:${from}`);
        const n = stmtReset.run(from).changes;
        return sendMessage(from, `✅ ${n} inside joke dihapus.`);
      } else if (jawab === 'N' || jawab === 'NO' || jawab === 'BATAL') {
        clearPending(`resetjoke:${from}`);
        return sendMessage(from, '✅ Dibatalkan.');
      }
      return sendMessage(from, 'Ketik *Y* / *N*.');
    }

    if (!sub || sub === 'help') {
      return sendMessage(from,
        '😏 *INSIDE JOKE*\n\n' +
        'Simpen joke pribadi kamu, nanti bot inget dan bisa pake di chat.\n\n' +
        '• `joke add Aku ganteng` — tambah\n' +
        '• `joke list` — lihat semua\n' +
        '• `joke random` — bot kasih random\n' +
        '• `joke hapus 1` — hapus\n' +
        '• `joke reset` — hapus semua'
      );
    }

    if (sub === 'add' || sub === 'tambah') {
      const text = args.slice(1).join(' ').trim();
      if (!text) return sendMessage(from, '❌ Format: `joke add <lelucon>`');
      if (text.length > 300) return sendMessage(from, '❌ Max 300 karakter.');
      stmtAdd.run(from, text, Date.now());
      return sendMessage(from, `😏 Inside joke disimpen:\n\n_"${text}"_`);
    }

    if (sub === 'list' || sub === 'ls') {
      const list = stmtList.all(from);
      if (!list.length) return sendMessage(from, '😏 Belum ada inside joke.\n\nTambah: `joke add Aku ganteng`');
      const lines = list.map(j => `*${j.id}.* ${j.text}`).join('\n');
      return sendMessage(from, `😏 *INSIDE JOKE KAMU (${list.length})*\n\n${lines}`);
    }

    if (sub === 'random' || sub === 'acak') {
      const list = stmtList.all(from);
      if (!list.length) return sendMessage(from, '😏 Belum ada joke. Tambah dulu ya.');
      const pick = list[Math.floor(Math.random() * list.length)];
      return sendMessage(from, `😏 _"${pick.text}"_`);
    }

    if (sub === 'hapus' || sub === 'del' || sub === 'delete') {
      const id = parseInt(args?.[1], 10);
      if (isNaN(id)) return sendMessage(from, '❌ Format: `joke hapus <id>`');
      const ok = stmtDel.run(id, from).changes > 0;
      return sendMessage(from, ok ? `✅ Joke #${id} dihapus.` : `❌ Gak ketemu.`);
    }

    if (sub === 'reset') {
      setPending(`resetjoke:${from}`, {});
      return sendMessage(from, '⚠️ Hapus semua inside joke? Ketik *Y* / *N*.');
    }

    return sendMessage(from, `❌ Sub-command *${sub}* gak ada. Ketik \`joke help\`.`);
  },
};
