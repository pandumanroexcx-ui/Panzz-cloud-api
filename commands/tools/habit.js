const db = require('../../lib/db');
const { setPending, getPending, clearPending } = require('../../lib/pending-downloads');

const stmtAddHabit = db.prepare('INSERT INTO habits (user_id, name, created_at) VALUES (?, ?, ?)');
const stmtListHabit = db.prepare('SELECT * FROM habits WHERE user_id = ? ORDER BY id ASC');
const stmtGetHabit = db.prepare('SELECT * FROM habits WHERE id = ? AND user_id = ?');
const stmtDelHabit = db.prepare('DELETE FROM habits WHERE id = ? AND user_id = ?');
const stmtDelLogs = db.prepare('DELETE FROM habit_logs WHERE habit_id = ?');
const stmtInsertLog = db.prepare('INSERT OR IGNORE INTO habit_logs (habit_id, date_str, created_at) VALUES (?, ?, ?)');
const stmtDeleteLog = db.prepare('DELETE FROM habit_logs WHERE habit_id = ? AND date_str = ?');
const stmtCountLog = db.prepare('SELECT COUNT(*) as total FROM habit_logs WHERE habit_id = ?');
const stmtLogsLast7 = db.prepare('SELECT date_str FROM habit_logs WHERE habit_id = ? AND date_str >= ? ORDER BY date_str');

function getTodayWIB() {
  const now = new Date();
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return wib.toISOString().slice(0, 10);
}

module.exports = {
  name: 'habit',
  alias: ['kebiasaan'],
  category: 'tools',
  description: 'Track kebiasaan harian (olahraga, minum air, dll)',

  async run({ from, args, sendMessage, message }) {
    const sub = (args?.[0] || '').toLowerCase();

    const pendingDel = getPending(`delhabit:${from}`);
    if (pendingDel) {
      const jawab = (message?.text?.body || '').trim().toUpperCase();
      if (jawab === 'Y' || jawab === 'YA') {
        clearPending(`delhabit:${from}`);
        stmtDelLogs.run(pendingDel.id);
        const ok = stmtDelHabit.run(pendingDel.id, from).changes > 0;
        return sendMessage(from, ok ? `✅ Habit #${pendingDel.id} dihapus.` : `❌ Gak ketemu.`);
      } else if (jawab === 'N' || jawab === 'NO' || jawab === 'BATAL') {
        clearPending(`delhabit:${from}`);
        return sendMessage(from, '✅ Dibatalkan.');
      }
      return sendMessage(from, 'Ketik *Y* konfirmasi, atau *N* batal.');
    }

    if (!sub || sub === 'help') {
      return sendMessage(from,
        '🎯 *HABIT TRACKER*\n\n' +
        '• `habit add Olahraga` — tambah habit\n' +
        '• `habit list` — lihat semua habit + streak\n' +
        '• `habit done 1` — tandai hari ini selesai\n' +
        '• `habit undo 1` — batal hari ini\n' +
        '• `habit hapus 1` — hapus habit\n\n' +
        '_Track kebiasaan kayak olahraga, baca buku, minum air, dll._'
      );
    }

    if (sub === 'add' || sub === 'tambah') {
      const name = args.slice(1).join(' ').trim();
      if (!name) return sendMessage(from, '❌ Format: `habit add <nama habit>`');
      if (name.length > 50) return sendMessage(from, '❌ Max 50 karakter.');
      stmtAddHabit.run(from, name, Date.now());
      return sendMessage(from, `✅ Habit ditambah: *${name}*\n\nKetik \`habit done <id>\` tiap hari selesai.`);
    }

    if (sub === 'list' || sub === 'ls') {
      const list = stmtListHabit.all(from);
      if (!list.length) return sendMessage(from, '📭 Belum ada habit. Tambah: `habit add Olahraga`');

      const today = getTodayWIB();
      const lines = [];
      for (const h of list) {
        const total = stmtCountLog.get(h.id).total;
        const todayDone = stmtLogsLast7.all(h.id, today).some(l => l.date_str === today);

        // Hitung streak 7 hari terakhir
        const logs7 = stmtLogsLast7.all(h.id, new Date(Date.now() + 7*60*60*1000 - 6*86400000).toISOString().slice(0,10));
        const logSet = new Set(logs7.map(l => l.date_str));
        let streak = 0;
        for (let i = 0; i < 7; i++) {
          const d = new Date(Date.now() + 7*60*60*1000 - i * 86400000).toISOString().slice(0, 10);
          if (logSet.has(d)) streak++;
          else break;
        }

        const status = todayDone ? '✅' : '⬜';
        const fire = '🔥'.repeat(Math.min(streak, 5));
        lines.push(`${status} *${h.id}.* ${h.name}\n    Streak: ${streak} hari ${fire} • Total: ${total}x`);
      }

      return sendMessage(from, `🎯 *HABIT KAMU (${list.length})*\n\n${lines.join('\n\n')}`);
    }

    if (sub === 'done') {
      const id = parseInt(args?.[1], 10);
      if (isNaN(id)) return sendMessage(from, '❌ Format: `habit done <id>`');
      const habit = stmtGetHabit.get(id, from);
      if (!habit) return sendMessage(from, `❌ Habit #${id} gak ketemu.`);

      const today = getTodayWIB();
      stmtInsertLog.run(id, today, Date.now());
      const total = stmtCountLog.get(id).total;
      return sendMessage(from, `✅ *${habit.name}* selesai hari ini!\n\n🎯 Total: ${total}x\n💪 Keep it up!`);
    }

    if (sub === 'undo') {
      const id = parseInt(args?.[1], 10);
      if (isNaN(id)) return sendMessage(from, '❌ Format: `habit undo <id>`');
      const habit = stmtGetHabit.get(id, from);
      if (!habit) return sendMessage(from, `❌ Habit #${id} gak ketemu.`);

      const today = getTodayWIB();
      const changes = stmtDeleteLog.run(id, today).changes;
      return sendMessage(from, changes > 0 ? `↩️ Berhasil batalin *${habit.name}* hari ini.` : `❌ Belum ada log hari ini.`);
    }

    if (sub === 'hapus' || sub === 'del' || sub === 'delete') {
      const id = parseInt(args?.[1], 10);
      if (isNaN(id)) return sendMessage(from, '❌ Format: `habit hapus <id>`');
      const habit = stmtGetHabit.get(id, from);
      if (!habit) return sendMessage(from, `❌ Habit #${id} gak ketemu.`);
      setPending(`delhabit:${from}`, { id });
      return sendMessage(from, `⚠️ Hapus habit *${habit.name}* beserta log-nya?\n\nKetik *Y* / *N*.`);
    }

    return sendMessage(from, `❌ Sub-command *${sub}* gak ada. Ketik \`habit help\``);
  },
};
