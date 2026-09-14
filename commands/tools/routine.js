const { addRoutine, getUserRoutines, deleteRoutine } = require('../../lib/routine-store');
const { setPending, getPending, clearPending } = require('../../lib/pending-downloads');

module.exports = {
  name: 'routine',
  alias: ['rutin', 'kebiasaan'],
  category: 'tools',
  description: 'Atur pengingat aktivitas harian otomatis (sarapan, mandi, tidur, dll)',

  async run({ from, args, sendMessage, message }) {
    const sub = (args?.[0] || '').toLowerCase();

    // Cek konfirmasi hapus
    const pendingDel = getPending(`delroutine:${from}`);
    if (pendingDel) {
      const jawab = (message?.text?.body || '').trim().toUpperCase();
      if (jawab === 'Y' || jawab === 'YA') {
        clearPending(`delroutine:${from}`);
        const ok = deleteRoutine(from, pendingDel.id);
        return sendMessage(from, ok ? `✅ Routine #${pendingDel.id} dihapus.` : `❌ Gak ketemu.`);
      } else if (jawab === 'N' || jawab === 'NO' || jawab === 'BATAL') {
        clearPending(`delroutine:${from}`);
        return sendMessage(from, '✅ Dibatalkan.');
      } else {
        return sendMessage(from, `Ketik *Y* buat konfirmasi hapus, atau *N* buat batal.`);
      }
    }

    if (sub === 'list' || sub === 'daftar') {
      const list = getUserRoutines(from);
      if (!list.length) {
        return sendMessage(from, '📭 Belum ada routine harian.\n\nTambah pake:\n`.routine add 07:00 Waktunya sarapan`');
      }
      const lines = list.map(r => {
        const jam = String(r.hour).padStart(2, '0') + ':' + String(r.minute).padStart(2, '0');
        return `• *${jam}* — ${r.text}\n  _hapus: .routine del ${r.id}_`;
      });
      return sendMessage(from, `⏰ *ROUTINE HARIAN KAMU*\n\n${lines.join('\n\n')}`);
    }

    if (sub === 'del' || sub === 'hapus' || sub === 'delete') {
      const id = parseInt(args?.[1], 10);
      if (isNaN(id)) return sendMessage(from, '❌ Format: .routine del <id>\nLihat id pake: .routine list');

      const list = getUserRoutines(from);
      const target = list.find(r => r.id === id);
      if (!target) return sendMessage(from, `❌ Routine #${id} gak ketemu.`);

      const jam = String(target.hour).padStart(2, '0') + ':' + String(target.minute).padStart(2, '0');
      setPending(`delroutine:${from}`, { id });
      return sendMessage(from,
        `⚠️ *Konfirmasi hapus routine:*\n\n` +
        `⏰ ${jam} — ${target.text}\n\n` +
        `Ketik *Y* buat hapus, *N* buat batal.`
      );
    }

    if (sub === 'add' || sub === 'tambah') {
      const timeMatch = (args?.[1] || '').match(/^(\d{1,2}):(\d{2})$/);
      if (!timeMatch) {
        return sendMessage(from,
          '📝 Format: .routine add <jam> <pesan>\n\n' +
          '*Contoh:*\n' +
          '.routine add 07:00 Waktunya sarapan\n' +
          '.routine add 16:00 Waktunya mandi\n' +
          '.routine add 21:00 Waktunya tidur'
        );
      }
      const hour = parseInt(timeMatch[1], 10);
      const minute = parseInt(timeMatch[2], 10);
      if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        return sendMessage(from, '❌ Jam gak valid. Contoh: 07:00, 16:30, 21:00');
      }
      const text = args.slice(2).join(' ');
      if (!text || text.length < 2) return sendMessage(from, '❌ Pesannya kosong.');
      if (text.length > 200) return sendMessage(from, '❌ Pesan kepanjangan (max 200).');

      addRoutine(from, hour, minute, text);
      const jam = String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0');
      return sendMessage(from,
        `✅ *Routine ditambahkan!*\n\n` +
        `⏰ Jam: *${jam}* (setiap hari, WIB)\n` +
        `📝 Pesan: ${text}\n\n` +
        `_Lihat daftar: .routine list_`
      );
    }

    return sendMessage(from,
      '⏰ *ROUTINE HARIAN*\n\n' +
      'Bot bakal chat otomatis setiap hari di jam yang kamu set (WIB).\n\n' +
      '*Command:*\n' +
      '• `.routine add 07:00 Waktunya sarapan`\n' +
      '• `.routine list` — lihat daftar\n' +
      '• `.routine del <id>` — hapus (perlu konfirmasi)\n\n' +
      '*Contoh routine:*\n' +
      '• 07:00 — Waktunya sarapan\n' +
      '• 12:00 — Makan siang\n' +
      '• 16:00 — Waktunya mandi\n' +
      '• 19:00 — Makan malam\n' +
      '• 22:00 — Waktunya tidur'
    );
  },
};
