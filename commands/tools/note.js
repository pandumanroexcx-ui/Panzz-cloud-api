const db = require('../../lib/db');
const { setPending, getPending, clearPending } = require('../../lib/pending-downloads');

const stmtAdd = db.prepare('INSERT INTO notes (user_id, title, content, created_at) VALUES (?, ?, ?, ?)');
const stmtList = db.prepare('SELECT id, title, created_at FROM notes WHERE user_id = ? ORDER BY id DESC');
const stmtGet = db.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?');
const stmtDel = db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?');
const stmtReset = db.prepare('DELETE FROM notes WHERE user_id = ?');

module.exports = {
  name: 'note',
  alias: ['notes', 'catatan'],
  category: 'tools',
  description: 'Catatan pribadi',

  async run({ from, args, sendMessage, message }) {
    const sub = (args?.[0] || '').toLowerCase();

    const pendingReset = getPending(`resetnote:${from}`);
    if (pendingReset) {
      const jawab = (message?.text?.body || '').trim().toUpperCase();
      if (jawab === 'Y' || jawab === 'YA') {
        clearPending(`resetnote:${from}`);
        const n = stmtReset.run(from).changes;
        return sendMessage(from, `✅ ${n} catatan dihapus.`);
      } else if (jawab === 'N' || jawab === 'NO' || jawab === 'BATAL') {
        clearPending(`resetnote:${from}`);
        return sendMessage(from, '✅ Dibatalkan.');
      }
      return sendMessage(from, 'Ketik *Y* konfirmasi, atau *N* batal.');
    }

    if (!sub || sub === 'help') {
      return sendMessage(from,
        '📒 *CATATAN PRIBADI*\n\n' +
        '• `note add Judul | Isi catatan` — tambah\n' +
        '• `note list` — lihat daftar\n' +
        '• `note lihat 1` — buka catatan\n' +
        '• `note hapus 1` — hapus\n' +
        '• `note reset` — hapus semua'
      );
    }

    if (sub === 'add' || sub === 'tambah') {
      const raw = args.slice(1).join(' ');
      if (!raw) return sendMessage(from, '❌ Format: `note add Judul | Isi catatan`');

      const parts = raw.split('|').map(s => s.trim());
      const title = parts[0];
      const content = parts.slice(1).join(' | ') || '';
      if (!title) return sendMessage(from, '❌ Judul kosong.');
      if (title.length > 80) return sendMessage(from, '❌ Judul max 80 karakter.');
      if (content.length > 2000) return sendMessage(from, '❌ Isi max 2000 karakter.');

      const info = stmtAdd.run(from, title, content, Date.now());
      return sendMessage(from, `✅ Catatan #${info.lastInsertRowid} disimpan:\n📒 *${title}*`);
    }

    if (sub === 'list' || sub === 'ls') {
      const list = stmtList.all(from);
      if (!list.length) return sendMessage(from, '📭 Belum ada catatan. Tambah: `note add Judul | Isi`');
      const lines = list.map(n => `*${n.id}.* ${n.title}`).join('\n');
      return sendMessage(from, `📒 *DAFTAR CATATAN (${list.length})*\n\n${lines}\n\n_Ketik \`note lihat <id>\` buat buka._`);
    }

    if (sub === 'lihat' || sub === 'view' || sub === 'get') {
      const id = parseInt(args?.[1], 10);
      if (isNaN(id)) return sendMessage(from, '❌ Format: `note lihat <id>`');
      const note = stmtGet.get(id, from);
      if (!note) return sendMessage(from, `❌ Catatan #${id} gak ketemu.`);
      return sendMessage(from, `📒 *${note.title}*\n\n${note.content || '_(kosong)_'}`);
    }

    if (sub === 'hapus' || sub === 'del' || sub === 'delete') {
      const id = parseInt(args?.[1], 10);
      if (isNaN(id)) return sendMessage(from, '❌ Format: `note hapus <id>`');
      const ok = stmtDel.run(id, from).changes > 0;
      return sendMessage(from, ok ? `✅ Catatan #${id} dihapus.` : `❌ Catatan #${id} gak ketemu.`);
    }

    if (sub === 'reset') {
      setPending(`resetnote:${from}`, {});
      return sendMessage(from, '⚠️ Hapus semua catatan? Ketik *Y* / *N*.');
    }

    return sendMessage(from, `❌ Sub-command *${sub}* gak ada. Ketik \`note help\``);
  },
};
