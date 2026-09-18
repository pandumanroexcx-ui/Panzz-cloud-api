const db = require('../../lib/db');
const { setPending, getPending, clearPending } = require('../../lib/pending-downloads');

const stmtAdd = db.prepare('INSERT INTO birthdays (user_id, name, date_str, created_at) VALUES (?, ?, ?, ?)');
const stmtList = db.prepare('SELECT * FROM birthdays WHERE user_id = ? ORDER BY date_str ASC');
const stmtDel = db.prepare('DELETE FROM birthdays WHERE id = ? AND user_id = ?');
const stmtReset = db.prepare('DELETE FROM birthdays WHERE user_id = ?');

function hitungHariSampai(dateStr) {
  const today = new Date();
  const wib = new Date(today.getTime() + 7 * 60 * 60 * 1000);
  const [_, m, d] = dateStr.split('-').map(Number);
  let nextBday = new Date(Date.UTC(wib.getUTCFullYear(), m - 1, d));
  const nowUTC = new Date(Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth(), wib.getUTCDate()));
  if (nextBday < nowUTC) nextBday = new Date(Date.UTC(wib.getUTCFullYear() + 1, m - 1, d));
  return Math.round((nextBday - nowUTC) / 86400000);
}

module.exports = {
  name: 'ultah',
  alias: ['birthday', 'ultahku'],
  category: 'tools',
  description: 'Tracker ulang tahun teman',

  async run({ from, args, sendMessage, message }) {
    const sub = (args?.[0] || '').toLowerCase();

    const pendingReset = getPending(`resetul:${from}`);
    if (pendingReset) {
      const jawab = (message?.text?.body || '').trim().toUpperCase();
      if (jawab === 'Y' || jawab === 'YA') {
        clearPending(`resetul:${from}`);
        const n = stmtReset.run(from).changes;
        return sendMessage(from, `✅ ${n} ultah dihapus.`);
      } else if (jawab === 'N' || jawab === 'NO' || jawab === 'BATAL') {
        clearPending(`resetul:${from}`);
        return sendMessage(from, '✅ Dibatalkan.');
      }
      return sendMessage(from, 'Ketik *Y* / *N*.');
    }

    if (!sub || sub === 'help') {
      return sendMessage(from,
        '🎂 *BIRTHDAY TRACKER*\n\n' +
        '• `ultah add Andi 15/08/2000` — tambah\n' +
        '• `ultah add Sarah 25-12-1998` — format lain\n' +
        '• `ultah list` — lihat semua + hari tersisa\n' +
        '• `ultah hapus 1` — hapus\n' +
        '• `ultah reset` — hapus semua\n\n' +
        '_Simpen ultah teman/keluarga biar gak lupa!_'
      );
    }

    if (sub === 'add' || sub === 'tambah') {
      const name = args[1];
      const dateArg = args[2];
      if (!name || !dateArg) return sendMessage(from, '❌ Format: `ultah add <nama> DD/MM/YYYY`\nContoh: `ultah add Andi 15/08/2000`');

      const m = dateArg.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
      if (!m) return sendMessage(from, '❌ Format tanggal: DD/MM/YYYY');

      const d = parseInt(m[1], 10), mo = parseInt(m[2], 10), y = parseInt(m[3], 10);
      if (mo < 1 || mo > 12 || d < 1 || d > 31) return sendMessage(from, '❌ Tanggal gak valid.');

      const dateStr = `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      stmtAdd.run(from, name.slice(0, 50), dateStr, Date.now());
      const sisa = hitungHariSampai(dateStr);
      return sendMessage(from,
        `🎂 Ultah *${name}* disimpan!\n\n` +
        `📅 ${dateArg}\n` +
        `⏳ ${sisa === 0 ? '🎉 HARI INI!' : `${sisa} hari lagi`}`
      );
    }

    if (sub === 'list' || sub === 'ls') {
      const list = stmtList.all(from);
      if (!list.length) return sendMessage(from, '📭 Belum ada ultah. Tambah: `ultah add Andi 15/08/2000`');

      const withDays = list.map(b => ({ ...b, sisa: hitungHariSampai(b.date_str) }))
                            .sort((a, b) => a.sisa - b.sisa);

      const lines = withDays.map(b => {
        const [_, m, d] = b.date_str.split('-');
        const tgl = `${d}/${m}`;
        let info = `${b.sisa} hari`;
        if (b.sisa === 0) info = '🎉 HARI INI!';
        else if (b.sisa === 1) info = '🎁 BESOK!';
        else if (b.sisa <= 7) info = `⚠️ ${b.sisa} hari`;
        return `🎂 *${b.name}* — ${tgl} (${info})`;
      });

      return sendMessage(from, `🎂 *DAFTAR ULANG TAHUN (${list.length})*\n\n${lines.join('\n')}`);
    }

    if (sub === 'hapus' || sub === 'del' || sub === 'delete') {
      const id = parseInt(args?.[1], 10);
      if (isNaN(id)) return sendMessage(from, '❌ Format: `ultah hapus <id>`');
      const ok = stmtDel.run(id, from).changes > 0;
      return sendMessage(from, ok ? `✅ Ultah #${id} dihapus.` : `❌ Gak ketemu.`);
    }

    if (sub === 'reset') {
      setPending(`resetul:${from}`, {});
      return sendMessage(from, '⚠️ Hapus semua ultah? Ketik *Y* / *N*.');
    }

    return sendMessage(from, `❌ Sub-command *${sub}* gak ada. Ketik \`ultah help\`.`);
  },
};
