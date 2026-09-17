const db = require('../../lib/db');
const { setPending, getPending, clearPending } = require('../../lib/pending-downloads');

const stmtAdd = db.prepare('INSERT INTO bookmarks (user_id, title, url, tag, created_at) VALUES (?, ?, ?, ?, ?)');
const stmtList = db.prepare('SELECT * FROM bookmarks WHERE user_id = ? ORDER BY id DESC');
const stmtListTag = db.prepare('SELECT * FROM bookmarks WHERE user_id = ? AND tag = ? ORDER BY id DESC');
const stmtSearch = db.prepare('SELECT * FROM bookmarks WHERE user_id = ? AND (title LIKE ? OR tag LIKE ?) ORDER BY id DESC');
const stmtGet = db.prepare('SELECT * FROM bookmarks WHERE id = ? AND user_id = ?');
const stmtDel = db.prepare('DELETE FROM bookmarks WHERE id = ? AND user_id = ?');
const stmtReset = db.prepare('DELETE FROM bookmarks WHERE user_id = ?');

module.exports = {
  name: 'bm',
  alias: ['bookmark', 'link', 'simpenlink'],
  category: 'tools',
  description: 'Simpen link penting (bookmark)',

  async run({ from, args, sendMessage, message }) {
    const sub = (args?.[0] || '').toLowerCase();

    const pendingReset = getPending(`resetbm:${from}`);
    if (pendingReset) {
      const jawab = (message?.text?.body || '').trim().toUpperCase();
      if (jawab === 'Y' || jawab === 'YA') {
        clearPending(`resetbm:${from}`);
        const n = stmtReset.run(from).changes;
        return sendMessage(from, `✅ ${n} bookmark dihapus.`);
      } else if (jawab === 'N' || jawab === 'NO' || jawab === 'BATAL') {
        clearPending(`resetbm:${from}`);
        return sendMessage(from, '✅ Dibatalkan.');
      }
      return sendMessage(from, 'Ketik *Y* / *N*.');
    }

    if (!sub || sub === 'help') {
      return sendMessage(from,
        '🔖 *LINK SAVER*\n\n' +
        '• `bm add Google | google.com` — tambah\n' +
        '• `bm add Tutorial CSS | url | coding` — dengan tag\n' +
        '• `bm list` — lihat semua\n' +
        '• `bm tag coding` — filter by tag\n' +
        '• `bm cari tutorial` — cari\n' +
        '• `bm hapus 1` — hapus\n' +
        '• `bm reset` — hapus semua'
      );
    }

    if (sub === 'add' || sub === 'tambah') {
      const raw = args.slice(1).join(' ');
      if (!raw) return sendMessage(from, '❌ Format: `bm add Judul | url | [tag]`');

      const parts = raw.split('|').map(s => s.trim());
      if (parts.length < 2) return sendMessage(from, '❌ Harus ada `|` antara judul dan url.\nContoh: `bm add Google | google.com`');

      const title = parts[0];
      let url = parts[1];
      const tag = parts[2] || null;

      if (!title || title.length > 100) return sendMessage(from, '❌ Judul max 100 karakter.');
      if (!url) return sendMessage(from, '❌ URL kosong.');
      if (!url.startsWith('http')) url = 'https://' + url;
      if (tag && tag.length > 30) return sendMessage(from, '❌ Tag max 30 karakter.');

      stmtAdd.run(from, title, url, tag, Date.now());
      return sendMessage(from, `🔖 Bookmark disimpan:\n\n📌 *${title}*\n🔗 ${url}${tag ? `\n🏷️ ${tag}` : ''}`);
    }

    if (sub === 'list' || sub === 'ls') {
      const list = stmtList.all(from);
      if (!list.length) return sendMessage(from, '📭 Belum ada bookmark. Tambah: `bm add Google | google.com`');
      const lines = list.slice(0, 20).map(b => `*${b.id}.* ${b.title}${b.tag ? ` \`[${b.tag}]\`` : ''}\n    🔗 ${b.url}`);
      return sendMessage(from, `🔖 *BOOKMARK KAMU (${list.length})*\n\n${lines.join('\n\n')}`);
    }

    if (sub === 'tag') {
      const tag = args.slice(1).join(' ').toLowerCase();
      if (!tag) return sendMessage(from, '❌ Format: `bm tag <tag>`');
      const list = stmtListTag.all(from, tag);
      if (!list.length) return sendMessage(from, `📭 Gak ada bookmark tag *${tag}*.`);
      const lines = list.map(b => `*${b.id}.* ${b.title}\n    🔗 ${b.url}`);
      return sendMessage(from, `🏷️ *BOOKMARK [${tag}] (${list.length})*\n\n${lines.join('\n\n')}`);
    }

    if (sub === 'cari' || sub === 'search' || sub === 'find') {
      const q = '%' + args.slice(1).join(' ').toLowerCase() + '%';
      const list = stmtSearch.all(from, q, q);
      if (!list.length) return sendMessage(from, `📭 Gak ada bookmark cocok.`);
      const lines = list.map(b => `*${b.id}.* ${b.title}${b.tag ? ` \`[${b.tag}]\`` : ''}\n    🔗 ${b.url}`);
      return sendMessage(from, `🔍 *HASIL (${list.length})*\n\n${lines.join('\n\n')}`);
    }

    if (sub === 'hapus' || sub === 'del' || sub === 'delete') {
      const id = parseInt(args?.[1], 10);
      if (isNaN(id)) return sendMessage(from, '❌ Format: `bm hapus <id>`');
      const ok = stmtDel.run(id, from).changes > 0;
      return sendMessage(from, ok ? `✅ Bookmark #${id} dihapus.` : `❌ Gak ketemu.`);
    }

    if (sub === 'reset') {
      setPending(`resetbm:${from}`, {});
      return sendMessage(from, '⚠️ Hapus semua bookmark? Ketik *Y* / *N*.');
    }

    // Kalau sub bukan command, anggap user mau search
    const q = '%' + sub + '%';
    const list = stmtSearch.all(from, q, q);
    if (list.length) {
      const lines = list.slice(0, 10).map(b => `*${b.id}.* ${b.title}${b.tag ? ` \`[${b.tag}]\`` : ''}\n    🔗 ${b.url}`);
      return sendMessage(from, `🔍 *HASIL (${list.length})*\n\n${lines.join('\n\n')}`);
    }

    return sendMessage(from, `❌ Sub-command *${sub}* gak ada. Ketik \`bm help\``);
  },
};
