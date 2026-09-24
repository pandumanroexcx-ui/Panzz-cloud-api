const db = require('../../lib/db');
const { setPending, getPending, clearPending } = require('../../lib/pending-downloads');

const stmtBuat = db.prepare('INSERT INTO celengan (user_id, nama, target, saldo, created_at) VALUES (?, ?, ?, 0, ?)');
const stmtList = db.prepare('SELECT * FROM celengan WHERE user_id = ? ORDER BY id ASC');
const stmtGet = db.prepare('SELECT * FROM celengan WHERE id = ? AND user_id = ?');
const stmtNabung = db.prepare('UPDATE celengan SET saldo = saldo + ? WHERE id = ? AND user_id = ?');
const stmtAmbil = db.prepare('UPDATE celengan SET saldo = saldo - ? WHERE id = ? AND user_id = ?');
const stmtSetTarget = db.prepare('UPDATE celengan SET target = ? WHERE id = ? AND user_id = ?');
const stmtHapus = db.prepare('DELETE FROM celengan WHERE id = ? AND user_id = ?');
const stmtReset = db.prepare('DELETE FROM celengan WHERE user_id = ?');
const stmtTotal = db.prepare('SELECT SUM(saldo) as total FROM celengan WHERE user_id = ?');

function formatRupiah(n) {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

function parseAmount(input) {
  if (!input) return null;
  let s = String(input).toLowerCase().replace(/[.,](?=\d{3})/g, '').replace(/\s/g, '');
  const m = s.match(/^(\d+(?:\.\d+)?)(jt|juta|rb|ribu|k|m)?$/);
  if (!m) return null;
  const num = parseFloat(m[1]);
  const mult = { jt: 1e6, juta: 1e6, rb: 1e3, ribu: 1e3, k: 1e3, m: 1e6 }[m[2]] || 1;
  return Math.round(num * mult);
}

function progressBar(persen) {
  const p = Math.min(100, Math.max(0, persen));
  const filled = Math.round(p / 5);
  return '█'.repeat(filled) + '░'.repeat(20 - filled);
}

module.exports = {
  name: 'celengan',
  alias: ['tabung', 'nabung', 'simpanan'],
  category: 'tools',
  description: 'Celengan online (data per user, privat)',

  async run({ from, args, sendMessage, message }) {
    const sub = (args?.[0] || '').toLowerCase();

    // Reset konfirmasi
    const pendingReset = getPending(`resetceleng:${from}`);
    if (pendingReset) {
      const jawab = (message?.text?.body || '').trim().toUpperCase();
      if (jawab === 'Y' || jawab === 'YA') {
        clearPending(`resetceleng:${from}`);
        const n = stmtReset.run(from).changes;
        return sendMessage(from, `✅ ${n} celengan dihapus.`);
      } else if (jawab === 'N' || jawab === 'NO' || jawab === 'BATAL') {
        clearPending(`resetceleng:${from}`);
        return sendMessage(from, '✅ Dibatalkan.');
      }
      return sendMessage(from, 'Ketik *Y* / *N*.');
    }

    // HELP
    if (!sub || sub === 'help') {
      return sendMessage(from,
        '🐷 *CELENGAN DIGITAL*\n\n' +
        '🔒 *Data kamu PRIVAT* — cuma kamu yang bisa liat. User lain punya celengan sendiri.\n\n' +
        '*Command:*\n' +
        '• `celengan buat <nama> [target]` — bikin celengan baru\n' +
        '• `celengan list` — lihat semua celengan\n' +
        '• `celengan cek <id>` — detail 1 celengan\n' +
        '• `celengan nabung <id> <jumlah>` — tambah tabungan\n' +
        '• `celengan ambil <id> <jumlah>` — ambil tabungan\n' +
        '• `celengan target <id> <jumlah>` — set/ubah target\n' +
        '• `celengan hapus <id>` — hapus celengan\n' +
        '• `celengan reset` — hapus semua\n\n' +
        '*Contoh:*\n' +
        '`celengan buat Liburan Bali 5jt`\n' +
        '`celengan nabung 1 500rb`\n' +
        '`celengan cek 1`'
      );
    }

    // BUAT CELENGAN BARU
    if (sub === 'buat' || sub === 'bikin' || sub === 'add' || sub === 'tambah') {
      const parts = args.slice(1);
      if (!parts.length) return sendMessage(from, '❌ Format: `celengan buat <nama> [target]`\nContoh: `celengan buat Liburan Bali 5jt`');

      let target = 0;
      let namaParts = [...parts];

      // Cek arg terakhir apakah angka (target)
      const lastArg = namaParts[namaParts.length - 1];
      const amount = parseAmount(lastArg);
      if (amount && amount > 0) {
        target = amount;
        namaParts.pop();
      }

      const nama = namaParts.join(' ').trim();
      if (!nama) return sendMessage(from, '❌ Nama celengan kosong.');
      if (nama.length > 60) return sendMessage(from, '❌ Nama max 60 karakter.');

      const info = stmtBuat.run(from, nama, target, Date.now());
      const id = info.lastInsertRowid;

      let text = `🐷 *CELENGAN BARU DIBUAT!*\n\n`;
      text += `📛 Nama: *${nama}*\n`;
      text += `🆔 ID: \`${id}\`\n`;
      if (target) {
        text += `🎯 Target: ${formatRupiah(target)}\n`;
      } else {
        text += `🎯 Target: _(belum diset)_\n`;
      }
      text += `💰 Saldo: Rp 0\n\n`;
      text += `_Mulai nabung: \`celengan nabung ${id} 100rb\`_`;
      return sendMessage(from, text);
    }

    // LIST
    if (sub === 'list' || sub === 'ls') {
      const list = stmtList.all(from);
      if (!list.length) {
        return sendMessage(from, '🐷 Belum ada celengan.\n\nBikin: `celengan buat Liburan Bali 5jt`');
      }

      const total = stmtTotal.get(from).total || 0;
      let text = `🐷 *CELENGAN KAMU*\n\n`;
      for (const c of list) {
        const persen = c.target > 0 ? Math.round((c.saldo / c.target) * 100) : 0;
        text += `*${c.id}.* ${c.nama}\n`;
        text += `   💰 ${formatRupiah(c.saldo)}`;
        if (c.target > 0) {
          text += ` / ${formatRupiah(c.target)} (${persen}%)\n`;
        } else {
          text += `\n`;
        }
        text += `\n`;
      }
      text += `━━━━━━━━━━━━━━\n`;
      text += `💵 *Total semua celengan:* ${formatRupiah(total)}\n\n`;
      text += `_Cek detail: \`celengan cek <id>\`_`;
      return sendMessage(from, text);
    }

    // CEK DETAIL
    if (sub === 'cek' || sub === 'lihat' || sub === 'detail') {
      let id = parseInt(args?.[1], 10);

      // Kalau gak ada id & cuma 1 celengan, otomatis pilih itu
      if (isNaN(id)) {
        const list = stmtList.all(from);
        if (list.length === 1) id = list[0].id;
        else return sendMessage(from, '❌ Format: `celengan cek <id>`\n\nLihat ID di `celengan list`');
      }

      const c = stmtGet.get(id, from);
      if (!c) return sendMessage(from, `❌ Celengan #${id} gak ketemu.`);

      const persen = c.target > 0 ? Math.round((c.saldo / c.target) * 100) : 0;
      const bar = progressBar(persen);

      let text = `🐷 *${c.nama}*\n\n`;
      text += `🆔 ID: \`${c.id}\`\n`;
      text += `💰 Saldo: *${formatRupiah(c.saldo)}*\n`;
      if (c.target > 0) {
        text += `🎯 Target: *${formatRupiah(c.target)}*\n`;
        text += `📊 Progress: ${bar} ${persen}%\n`;
        const kurang = c.target - c.saldo;
        if (kurang > 0) {
          text += `📉 Kurang: ${formatRupiah(kurang)} lagi\n`;
        } else {
          text += `🎉 *Target tercapai!*\n`;
        }
      } else {
        text += `🎯 Target: _(belum diset)_\n`;
      }
      return sendMessage(from, text);
    }

    // NABUNG
    if (sub === 'nabung' || sub === 'isi') {
      const id = parseInt(args?.[1], 10);
      const amount = parseAmount(args?.[2]);
      if (isNaN(id) || !amount || amount <= 0) {
        return sendMessage(from, '❌ Format: `celengan nabung <id> <jumlah>`\nContoh: `celengan nabung 1 100rb`');
      }

      const c = stmtGet.get(id, from);
      if (!c) return sendMessage(from, `❌ Celengan #${id} gak ketemu.`);

      stmtNabung.run(amount, id, from);
      const updated = stmtGet.get(id, from);
      const persen = updated.target > 0 ? Math.round((updated.saldo / updated.target) * 100) : 0;

      let text = `✅ *Berhasil nabung!*\n\n`;
      text += `🐷 ${updated.nama}\n`;
      text += `💰 +${formatRupiah(amount)}\n`;
      text += `💵 Saldo: *${formatRupiah(updated.saldo)}*\n`;
      if (updated.target > 0) {
        text += `📊 Progress: ${progressBar(persen)} ${persen}%\n`;
        if (updated.saldo >= updated.target) {
          text += `\n🎉 *Selamat! Target tercapai!*`;
        }
      }
      return sendMessage(from, text);
    }

    // AMBIL
    if (sub === 'ambil' || sub === 'tarik' || sub === 'keluar') {
      const id = parseInt(args?.[1], 10);
      const amount = parseAmount(args?.[2]);
      if (isNaN(id) || !amount || amount <= 0) {
        return sendMessage(from, '❌ Format: `celengan ambil <id> <jumlah>`\nContoh: `celengan ambil 1 500rb`');
      }

      const c = stmtGet.get(id, from);
      if (!c) return sendMessage(from, `❌ Celengan #${id} gak ketemu.`);
      if (c.saldo < amount) return sendMessage(from, `❌ Saldo kurang! Cuma ada ${formatRupiah(c.saldo)}.`);

      stmtAmbil.run(amount, id, from);
      const updated = stmtGet.get(id, from);

      return sendMessage(from,
        `✅ *Berhasil ambil!*\n\n` +
        `🐷 ${updated.nama}\n` +
        `💸 -${formatRupiah(amount)}\n` +
        `💵 Sisa: *${formatRupiah(updated.saldo)}*`
      );
    }

    // SET TARGET
    if (sub === 'target') {
      const id = parseInt(args?.[1], 10);
      const target = parseAmount(args?.[2]);
      if (isNaN(id) || !target || target <= 0) {
        return sendMessage(from, '❌ Format: `celengan target <id> <jumlah>`\nContoh: `celengan target 1 10jt`');
      }
      const c = stmtGet.get(id, from);
      if (!c) return sendMessage(from, `❌ Celengan #${id} gak ketemu.`);

      stmtSetTarget.run(target, id, from);
      return sendMessage(from, `🎯 Target *${c.nama}* diset ke *${formatRupiah(target)}*`);
    }

    // HAPUS
    if (sub === 'hapus' || sub === 'del' || sub === 'delete') {
      const id = parseInt(args?.[1], 10);
      if (isNaN(id)) return sendMessage(from, '❌ Format: `celengan hapus <id>`');
      const c = stmtGet.get(id, from);
      if (!c) return sendMessage(from, `❌ Celengan #${id} gak ketemu.`);
      stmtHapus.run(id, from);
      return sendMessage(from, `🗑️ Celengan *${c.nama}* dihapus.\n\n_Saldo ${formatRupiah(c.saldo)} ikut kehapus._`);
    }

    // RESET
    if (sub === 'reset') {
      setPending(`resetceleng:${from}`, {});
      return sendMessage(from, '⚠️ *Konfirmasi:* Hapus SEMUA celengan kamu? Ketik *Y* / *N*.');
    }

    return sendMessage(from, `❌ Sub-command *${sub}* gak ada. Ketik \`celengan help\`.`);
  },
};
