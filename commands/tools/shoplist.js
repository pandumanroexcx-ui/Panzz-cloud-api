const db = require('../../lib/db');
const { setPending, getPending, clearPending } = require('../../lib/pending-downloads');

const stmtAdd = db.prepare('INSERT INTO shoplist (user_id, item, qty, created_at) VALUES (?, ?, ?, ?)');
const stmtList = db.prepare('SELECT * FROM shoplist WHERE user_id = ? AND done = 0 ORDER BY id ASC');
const stmtListDone = db.prepare('SELECT * FROM shoplist WHERE user_id = ? AND done = 1 ORDER BY id ASC');
const stmtDone = db.prepare('UPDATE shoplist SET done = 1 WHERE id = ? AND user_id = ?');
const stmtUndo = db.prepare('UPDATE shoplist SET done = 0 WHERE id = ? AND user_id = ?');
const stmtDel = db.prepare('DELETE FROM shoplist WHERE id = ? AND user_id = ?');
const stmtClearDone = db.prepare('DELETE FROM shoplist WHERE user_id = ? AND done = 1');
const stmtReset = db.prepare('DELETE FROM shoplist WHERE user_id = ?');

module.exports = {
  name: 'shoplist',
  alias: ['belanja', 'belanjaan', 'shopping'],
  category: 'tools',
  description: 'Daftar belanja',

  async run({ from, args, sendMessage, message }) {
    const sub = (args?.[0] || '').toLowerCase();

    const pendingReset = getPending(`resetshop:${from}`);
    if (pendingReset) {
      const jawab = (message?.text?.body || '').trim().toUpperCase();
      if (jawab === 'Y' || jawab === 'YA') {
        clearPending(`resetshop:${from}`);
        const n = stmtReset.run(from).changes;
        return sendMessage(from, `✅ ${n} item dihapus.`);
      } else if (jawab === 'N' || jawab === 'NO' || jawab === 'BATAL') {
        clearPending(`resetshop:${from}`);
        return sendMessage(from, '✅ Dibatalkan.');
      }
      return sendMessage(from, 'Ketik *Y* / *N*.');
    }

    if (!sub || sub === 'help') {
      return sendMessage(from,
        '🛒 *DAFTAR BELANJA*\n\n' +
        '• `belanja add Susu 2 kotak` — tambah item\n' +
        '• `belanja add Telur` — tambah tanpa qty\n' +
        '• `belanja list` — lihat yang belum dibeli\n' +
        '• `belanja done 1` — centang item\n' +
        '• `belanja hapus 1` — hapus item\n' +
        '• `belanja clear` — hapus yang udah dibeli\n' +
        '• `belanja reset` — hapus semua'
      );
    }

    if (sub === 'add' || sub === 'tambah') {
      const raw = args.slice(1).join(' ').trim();
      if (!raw) return sendMessage(from, '❌ Format: `belanja add <item> [qty]`\nContoh: `belanja add Susu 2 kotak`');

      // Coba pisah qty: "Susu 2 kotak" → item="Susu", qty="2 kotak"
      const match = raw.match(/^(.+?)\s+(\d+\s*\w*)$/);
      let item = raw, qty = null;
      if (match) {
        item = match[1].trim();
        qty = match[2].trim();
      }

      if (item.length > 80) return sendMessage(from, '❌ Item max 80 karakter.');
      stmtAdd.run(from, item, qty, Date.now());
      return sendMessage(from, `✅ Ditambah: *${item}*${qty ? ` (${qty})` : ''}`);
    }

    if (sub === 'list' || sub === 'ls') {
      const items = stmtList.all(from);
      const doneItems = stmtListDone.all(from);

      if (!items.length && !doneItems.length) {
        return sendMessage(from, '🛒 Daftar belanja kosong. Tambah: `belanja add Susu`');
      }

      let text = '🛒 *DAFTAR BELANJA*\n\n';
      if (items.length) {
        text += `📝 *Belum dibeli (${items.length}):*\n`;
        for (const it of items) {
          text += `⬜ *${it.id}.* ${it.item}${it.qty ? ` — ${it.qty}` : ''}\n`;
        }
      }
      if (doneItems.length) {
        text += `\n✅ *Udah dibeli (${doneItems.length}):*\n`;
        for (const it of doneItems) {
          text += `✅ ~${it.item}~${it.qty ? ` — ${it.qty}` : ''}\n`;
        }
      }
      text += `\n_Tap \`belanja done <id>\` buat centang._`;
      return sendMessage(from, text);
    }

    if (sub === 'done' || sub === 'check') {
      const id = parseInt(args?.[1], 10);
      if (isNaN(id)) return sendMessage(from, '❌ Format: `belanja done <id>`');
      const ok = stmtDone.run(id, from).changes > 0;
      return sendMessage(from, ok ? `✅ Item #${id} udah dibeli!` : `❌ Item #${id} gak ketemu.`);
    }

    if (sub === 'undo') {
      const id = parseInt(args?.[1], 10);
      if (isNaN(id)) return sendMessage(from, '❌ Format: `belanja undo <id>`');
      const ok = stmtUndo.run(id, from).changes > 0;
      return sendMessage(from, ok ? `↩️ Item #${id} dibalikin ke daftar.` : `❌ Gak ketemu.`);
    }

    if (sub === 'hapus' || sub === 'del' || sub === 'delete') {
      const id = parseInt(args?.[1], 10);
      if (isNaN(id)) return sendMessage(from, '❌ Format: `belanja hapus <id>`');
      const ok = stmtDel.run(id, from).changes > 0;
      return sendMessage(from, ok ? `✅ Item #${id} dihapus.` : `❌ Item #${id} gak ketemu.`);
    }

    if (sub === 'clear') {
      const n = stmtClearDone.run(from).changes;
      return sendMessage(from, `✅ ${n} item yang udah dibeli dihapus.`);
    }

    if (sub === 'reset') {
      setPending(`resetshop:${from}`, {});
      return sendMessage(from, '⚠️ Hapus semua item belanja? Ketik *Y* / *N*.');
    }

    return sendMessage(from, `❌ Sub-command *${sub}* gak ada. Ketik \`belanja help\``);
  },
};
