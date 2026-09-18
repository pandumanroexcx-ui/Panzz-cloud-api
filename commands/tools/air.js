const db = require('../../lib/db');
const { setPending, getPending, clearPending } = require('../../lib/pending-downloads');

const stmtAdd = db.prepare('INSERT INTO water_logs (user_id, amount_ml, date_str, created_at) VALUES (?, ?, ?, ?)');
const stmtToday = db.prepare('SELECT SUM(amount_ml) as total FROM water_logs WHERE user_id = ? AND date_str = ?');
const stmtLast7 = db.prepare('SELECT date_str, SUM(amount_ml) as total FROM water_logs WHERE user_id = ? AND date_str >= ? GROUP BY date_str ORDER BY date_str DESC');
const stmtReset = db.prepare('DELETE FROM water_logs WHERE user_id = ?');

function getTodayWIB() {
  const now = new Date();
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return wib.toISOString().slice(0, 10);
}

const TARGET = 2000; // 2 liter per hari

module.exports = {
  name: 'air',
  alias: ['minum', 'water'],
  category: 'tools',
  description: 'Tracker minum air harian',

  async run({ from, args, sendMessage, message }) {
    const sub = (args?.[0] || '').toLowerCase();

    const pendingReset = getPending(`resetair:${from}`);
    if (pendingReset) {
      const jawab = (message?.text?.body || '').trim().toUpperCase();
      if (jawab === 'Y' || jawab === 'YA') {
        clearPending(`resetair:${from}`);
        const n = stmtReset.run(from).changes;
        return sendMessage(from, `✅ ${n} log air dihapus.`);
      } else if (jawab === 'N' || jawab === 'NO' || jawab === 'BATAL') {
        clearPending(`resetair:${from}`);
        return sendMessage(from, '✅ Dibatalkan.');
      }
      return sendMessage(from, 'Ketik *Y* / *N*.');
    }

    if (!sub || sub === 'help') {
      return sendMessage(from,
        '💧 *WATER TRACKER*\n\n' +
        '• `air 250` — catat minum 250ml\n' +
        '• `air gelas` — catat 1 gelas (250ml)\n' +
        '• `air botol` — catat 1 botol (600ml)\n' +
        '• `air status` — lihat progress hari ini\n' +
        '• `air 7hari` — riwayat 7 hari\n' +
        '• `air reset` — hapus semua\n\n' +
        `🎯 Target: ${TARGET}ml (2 liter)/hari`
      );
    }

    if (sub === 'status' || sub === 'hariini') {
      const today = getTodayWIB();
      const total = stmtToday.get(from, today).total || 0;
      const persen = Math.min(100, Math.round((total / TARGET) * 100));
      const bar = '█'.repeat(Math.round(persen / 5)) + '░'.repeat(20 - Math.round(persen / 5));
      const sisa = Math.max(0, TARGET - total);

      let info = '';
      if (persen >= 100) info = '🎉 Mantap! Target harian tercapai!';
      else if (persen >= 50) info = '💪 Setengah jalan, lanjut!';
      else info = '💧 Ayo minum lagi!';

      return sendMessage(from,
        `💧 *WATER TRACKER HARI INI*\n\n` +
        `${bar} ${persen}%\n\n` +
        `📊 Total: *${total} ml* / ${TARGET} ml\n` +
        `📉 Sisa: ${sisa} ml\n\n` +
        info
      );
    }

    if (sub === '7hari' || sub === 'riwayat' || sub === 'history') {
      const today = getTodayWIB();
      const weekAgo = new Date(new Date(today + 'T00:00:00Z').getTime() - 6 * 86400000).toISOString().slice(0, 10);
      const rows = stmtLast7.all(from, weekAgo);

      if (!rows.length) return sendMessage(from, '📭 Belum ada log air.');

      const lines = rows.map(r => {
        const persen = Math.min(100, Math.round((r.total / TARGET) * 100));
        const bar = '█'.repeat(Math.round(persen / 10)) + '░'.repeat(10 - Math.round(persen / 10));
        return `📅 ${r.date_str} ${bar} ${persen}% (${r.total}ml)`;
      });

      return sendMessage(from, `💧 *RIWAYAT 7 HARI*\n\n${lines.join('\n')}`);
    }

    if (sub === 'reset') {
      setPending(`resetair:${from}`, {});
      return sendMessage(from, '⚠️ Hapus semua log air? Ketik *Y* / *N*.');
    }

    // Catat minum
    let ml = 0;
    if (sub === 'gelas') ml = 250;
    else if (sub === 'botol') ml = 600;
    else if (sub === 'cangkir') ml = 200;
    else ml = parseInt(sub, 10);

    if (isNaN(ml) || ml <= 0) {
      return sendMessage(from, '❌ Format: `air 250` atau `air gelas` atau `air botol`');
    }
    if (ml > 5000) return sendMessage(from, '❌ Gak mungkin sekali minum > 5000ml 😅');

    const today = getTodayWIB();
    stmtAdd.run(from, ml, today, Date.now());
    const total = stmtToday.get(from, today).total || 0;
    const persen = Math.min(100, Math.round((total / TARGET) * 100));

    return sendMessage(from,
      `💧 *+${ml} ml dicatat!*\n\n` +
      `📊 Total hari ini: *${total} ml* / ${TARGET} ml (${persen}%)\n\n` +
      (persen >= 100 ? '🎉 Target tercapai!' : `Sisa: ${TARGET - total} ml lagi`)
    );
  },
};
