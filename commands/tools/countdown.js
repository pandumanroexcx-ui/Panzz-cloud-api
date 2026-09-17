const db = require('../../lib/db');
const { setPending, getPending, clearPending } = require('../../lib/pending-downloads');

const stmtAdd = db.prepare('INSERT INTO countdowns (user_id, title, target_date, created_at) VALUES (?, ?, ?, ?)');
const stmtList = db.prepare('SELECT * FROM countdowns WHERE user_id = ? ORDER BY target_date ASC');
const stmtGet = db.prepare('SELECT * FROM countdowns WHERE id = ? AND user_id = ?');
const stmtDel = db.prepare('DELETE FROM countdowns WHERE id = ? AND user_id = ?');
const stmtReset = db.prepare('DELETE FROM countdowns WHERE user_id = ?');

function getTodayWIB() {
  const now = new Date();
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return wib.toISOString().slice(0, 10);
}

function hitungHari(targetDate) {
  const today = getTodayWIB();
  const t1 = new Date(today + 'T00:00:00Z').getTime();
  const t2 = new Date(targetDate + 'T00:00:00Z').getTime();
  return Math.round((t2 - t1) / 86400000);
}

module.exports = {
  name: 'countdown',
  alias: ['cd', 'hitungmundur', 'countdown'],
  category: 'tools',
  description: 'Hitung mundur ke tanggal penting',

  async run({ from, args, sendMessage, message }) {
    const sub = (args?.[0] || '').toLowerCase();

    const pendingReset = getPending(`resetcd:${from}`);
    if (pendingReset) {
      const jawab = (message?.text?.body || '').trim().toUpperCase();
      if (jawab === 'Y' || jawab === 'YA') {
        clearPending(`resetcd:${from}`);
        const n = stmtReset.run(from).changes;
        return sendMessage(from, `✅ ${n} countdown dihapus.`);
      } else if (jawab === 'N' || jawab === 'NO' || jawab === 'BATAL') {
        clearPending(`resetcd:${from}`);
        return sendMessage(from, '✅ Dibatalkan.');
      }
      return sendMessage(from, 'Ketik *Y* / *N*.');
    }

    if (!sub || sub === 'help') {
      return sendMessage(from,
        '⏳ *COUNTDOWN*\n\n' +
        '• `cd add 2026-12-25 Natal` — tambah countdown\n' +
        '• `cd add 25/12/2026 Natal` — format lain\n' +
        '• `cd list` — lihat semua countdown\n' +
        '• `cd hapus 1` — hapus\n\n' +
        '_Format tanggal: YYYY-MM-DD atau DD/MM/YYYY_'
      );
    }

    if (sub === 'add' || sub === 'tambah') {
      const dateArg = args[1];
      const title = args.slice(2).join(' ').trim();
      if (!dateArg || !title) {
        return sendMessage(from, '❌ Format: `cd add 2026-12-25 Natal`\nAtau: `cd add 25/12/2026 Natal`');
      }

      let targetDate = null;
      // Format YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateArg)) {
        targetDate = dateArg;
      }
      // Format DD/MM/YYYY
      else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateArg)) {
        const [d, m, y] = dateArg.split('/');
        targetDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }

      if (!targetDate || isNaN(new Date(targetDate).getTime())) {
        return sendMessage(from, '❌ Format tanggal salah. Pake `2026-12-25` atau `25/12/2026`.');
      }

      if (title.length > 60) return sendMessage(from, '❌ Judul max 60 karakter.');

      const hari = hitungHari(targetDate);
      stmtAdd.run(from, title, targetDate, Date.now());

      let info = '';
      if (hari > 0) info = `📅 Tinggal *${hari} hari* lagi.`;
      else if (hari === 0) info = `🎉 Hari ini!`;
      else info = `⏰ Udah lewat ${Math.abs(hari)} hari lalu.`;

      return sendMessage(from, `✅ Countdown ditambah:\n\n📌 *${title}*\n📆 ${targetDate}\n${info}`);
    }

    if (sub === 'list' || sub === 'ls') {
      const list = stmtList.all(from);
      if (!list.length) return sendMessage(from, '📭 Belum ada countdown. Tambah: `cd add 2026-12-25 Natal`');

      const lines = list.map(c => {
        const hari = hitungHari(c.target_date);
        let info = '';
        if (hari > 0) info = `*${hari} hari* lagi`;
        else if (hari === 0) info = `🎉 *HARI INI!*`;
        else info = `lewat ${Math.abs(hari)} hari`;

        return `📌 *${c.id}.* ${c.title}\n    📆 ${c.target_date} — ${info}`;
      });

      return sendMessage(from, `⏳ *COUNTDOWN KAMU (${list.length})*\n\n${lines.join('\n\n')}`);
    }

    if (sub === 'hapus' || sub === 'del' || sub === 'delete') {
      const id = parseInt(args?.[1], 10);
      if (isNaN(id)) return sendMessage(from, '❌ Format: `cd hapus <id>`');
      const ok = stmtDel.run(id, from).changes > 0;
      return sendMessage(from, ok ? `✅ Countdown #${id} dihapus.` : `❌ Gak ketemu.`);
    }

    if (sub === 'reset') {
      setPending(`resetcd:${from}`, {});
      return sendMessage(from, '⚠️ Hapus semua countdown? Ketik *Y* / *N*.');
    }

    return sendMessage(from, `❌ Sub-command *${sub}* gak ada. Ketik \`cd help\``);
  },
};
