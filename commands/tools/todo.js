const db = require('../../lib/db');
const { setPending, getPending, clearPending } = require('../../lib/pending-downloads');

const stmtAdd = db.prepare('INSERT INTO todos (user_id, text, created_at) VALUES (?, ?, ?)');
const stmtList = db.prepare('SELECT * FROM todos WHERE user_id = ? AND done = 0 ORDER BY id ASC');
const stmtListAll = db.prepare('SELECT * FROM todos WHERE user_id = ? ORDER BY done ASC, id ASC');
const stmtDone = db.prepare('UPDATE todos SET done = 1 WHERE id = ? AND user_id = ?');
const stmtDel = db.prepare('DELETE FROM todos WHERE id = ? AND user_id = ?');
const stmtReset = db.prepare('DELETE FROM todos WHERE user_id = ?');

module.exports = {
  name: 'todo',
  alias: ['tugas', 'todolist'],
  category: 'tools',
  description: 'To-Do list simpel',

  async run({ from, args, sendMessage, message }) {
    const sub = (args?.[0] || '').toLowerCase();

    const pendingReset = getPending(`resettodo:${from}`);
    if (pendingReset) {
      const jawab = (message?.text?.body || '').trim().toUpperCase();
      if (jawab === 'Y' || jawab === 'YA') {
        clearPending(`resettodo:${from}`);
        const n = stmtReset.run(from).changes;
        return sendMessage(from, `✅ ${n} todo dihapus.`);
      } else if (jawab === 'N' || jawab === 'NO' || jawab === 'BATAL') {
        clearPending(`resettodo:${from}`);
        return sendMessage(from, '✅ Dibatalkan.');
      }
      return sendMessage(from, 'Ketik *Y* konfirmasi, atau *N* batal.');
    }

    if (!sub || sub === 'help') {
      return sendMessage(from,
        '✅ *TO-DO LIST*\n\n' +
        '• `todo add Beli susu` — tambah tugas\n' +
        '• `todo list` — lihat tugas aktif\n' +
        '• `todo all` — lihat semua\n' +
        '• `todo done 1` — tandai selesai\n' +
        '• `todo hapus 1` — hapus\n' +
        '• `todo reset` — hapus semua'
      );
    }

    if (sub === 'add' || sub === 'tambah') {
      const text = args.slice(1).join(' ').trim();
      if (!text) return sendMessage(from, '❌ Format: `todo add <tugas>`');
      if (text.length > 200) return sendMessage(from, '❌ Max 200 karakter.');
      stmtAdd.run(from, text, Date.now());
      return sendMessage(from, `✅ Todo ditambah:\n📝 ${text}`);
    }

    if (sub === 'list' || sub === 'ls') {
      const list = stmtList.all(from);
      if (!list.length) return sendMessage(from, '📭 Gak ada tugas aktif. Tambah: `todo add Beli susu`');
      const lines = list.map(t => `*${t.id}.* ${t.text}`).join('\n');
      return sendMessage(from, `✅ *TO-DO AKTIF (${list.length})*\n\n${lines}`);
    }

    if (sub === 'all') {
      const list = stmtListAll.all(from);
      if (!list.length) return sendMessage(from, '📭 Belum ada todo.');
      const lines = list.map(t => `${t.done ? '✅' : '⬜'} *${t.id}.* ${t.text}`).join('\n');
      return sendMessage(from, `📋 *SEMUA TODO (${list.length})*\n\n${lines}`);
    }

    if (sub === 'done') {
      const id = parseInt(args?.[1], 10);
      if (isNaN(id)) return sendMessage(from, '❌ Format: `todo done <id>`');
      const ok = stmtDone.run(id, from).changes > 0;
      return sendMessage(from, ok ? `✅ Todo #${id} selesai!` : `❌ Todo #${id} gak ketemu.`);
    }

    if (sub === 'hapus' || sub === 'del' || sub === 'delete') {
      const id = parseInt(args?.[1], 10);
      if (isNaN(id)) return sendMessage(from, '❌ Format: `todo hapus <id>`');
      const ok = stmtDel.run(id, from).changes > 0;
      return sendMessage(from, ok ? `✅ Todo #${id} dihapus.` : `❌ Todo #${id} gak ketemu.`);
    }

    if (sub === 'reset') {
      setPending(`resettodo:${from}`, {});
      return sendMessage(from, '⚠️ Hapus semua todo? Ketik *Y* / *N*.');
    }

    return sendMessage(from, `❌ Sub-command *${sub}* gak ada. Ketik \`todo help\``);
  },
};
