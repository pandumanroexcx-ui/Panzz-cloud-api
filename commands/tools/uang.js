const {
  parseAmount, formatRupiah, getMonthKey,
  addTransaction, getSummary, deleteTransaction, resetAll, generatePdf,
} = require('../../lib/finance-store');
const { uploadDocument } = require('../../lib/whatsapp-media');
const { sendDocument } = require('../../lib/send-message');
const { setPending, getPending, clearPending } = require('../../lib/pending-downloads');

function formatMonth(monthKey) {
  const [y, m] = monthKey.split('-');
  const name = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'][parseInt(m) - 1];
  return `${name} ${y}`;
}

module.exports = {
  name: 'uang',
  alias: ['duit', 'finance', 'keuangan'],
  category: 'tools',
  description: 'Catatan keuangan (masuk/keluar) + export PDF',

  async run({ from, args, sendMessage, message }) {
    const sub = (args?.[0] || '').toLowerCase();

    // === Cek konfirmasi reset ===
    const pendingReset = getPending(`resetuang:${from}`);
    if (pendingReset) {
      const jawab = (message?.text?.body || '').trim().toUpperCase();
      if (jawab === 'Y' || jawab === 'YA') {
        clearPending(`resetuang:${from}`);
        const n = resetAll(from);
        return sendMessage(from, `✅ ${n} transaksi dihapus.`);
      } else if (jawab === 'N' || jawab === 'NO' || jawab === 'BATAL') {
        clearPending(`resetuang:${from}`);
        return sendMessage(from, '✅ Dibatalkan.');
      }
      return sendMessage(from, 'Ketik *Y* konfirmasi hapus, atau *N* batal.');
    }

    // === HELP ===
    if (!sub || sub === 'help') {
      return sendMessage(from,
        '💰 *CATATAN KEUANGAN*\n\n' +
        '*Command:*\n' +
        '• `uang masuk 2.5jt gaji` — catat pemasukan\n' +
        '• `uang keluar 15rb makan` — catat pengeluaran\n' +
        '• `uang laporan` — laporan bulan ini\n' +
        '• `uang pdf` — download laporan PDF\n' +
        '• `uang hapus <id>` — hapus transaksi\n' +
        '• `uang reset` — hapus semua (perlu konfirmasi)\n\n' +
        '*Format angka:* 2500000, 2.5jt, 500rb, 15k'
      );
    }

    // === MASUK / KELUAR ===
    if (sub === 'masuk' || sub === 'keluar' || sub === 'in' || sub === 'out') {
      const type = (sub === 'masuk' || sub === 'in') ? 'masuk' : 'keluar';
      const amount = parseAmount(args[1]);
      if (!amount) {
        return sendMessage(from, `❌ Jumlah gak valid.\n\nContoh: \`uang ${sub} 15000 makan\``);
      }
      const note = args.slice(2).join(' ').trim();
      if (!note) {
        return sendMessage(from, `❌ Kasih keterangan.\n\nContoh: \`uang ${sub} ${args[1]} keterangan\``);
      }
      if (note.length > 100) return sendMessage(from, '❌ Keterangan max 100 karakter.');

      addTransaction(from, type, amount, null, note);
      const summary = getSummary(from, getMonthKey());
      const emoji = type === 'masuk' ? '💰' : '💸';
      const label = type === 'masuk' ? 'Pemasukan' : 'Pengeluaran';

      return sendMessage(from,
        `${emoji} *${label} dicatat!*\n\n` +
        `💵 Jumlah: *${formatRupiah(amount)}*\n` +
        `📝 Ket: ${note}\n\n` +
        `📊 *Saldo bulan ini:*\n` +
        `Masuk: ${formatRupiah(summary.masuk)}\n` +
        `Keluar: ${formatRupiah(summary.keluar)}\n` +
        `Saldo: *${formatRupiah(summary.saldo)}*`
      );
    }

    // === LAPORAN (text) ===
    if (sub === 'laporan' || sub === 'report' || sub === 'list') {
      const monthKey = getMonthKey();
      const summary = getSummary(from, monthKey);

      if (!summary.txs.length) {
        return sendMessage(from, `📭 Belum ada transaksi di ${formatMonth(monthKey)}.`);
      }

      let text = `💰 *LAPORAN ${formatMonth(monthKey).toUpperCase()}*\n\n`;
      text += `📥 Masuk: ${formatRupiah(summary.masuk)}\n`;
      text += `📤 Keluar: ${formatRupiah(summary.keluar)}\n`;
      text += `💼 Saldo: *${formatRupiah(summary.saldo)}*\n\n`;
      text += `📋 *Detail (max 15 terakhir):*\n\n`;

      const list = summary.txs.slice(-15).reverse();
      for (const t of list) {
        const d = new Date(t.created_at + 7 * 60 * 60 * 1000);
        const tgl = `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
        const sign = t.type === 'masuk' ? '➕' : '➖';
        text += `${sign} ${tgl} ${t.note} — ${formatRupiah(t.amount)}\n`;
      }

      if (summary.txs.length > 15) text += `\n_...dan ${summary.txs.length - 15} transaksi lain_`;

      text += `\n\n📄 Ketik \`uang pdf\` buat download PDF lengkap.`;
      return sendMessage(from, text);
    }

    // === PDF ===
    if (sub === 'pdf' || sub === 'export') {
      const monthKey = getMonthKey();
      await sendMessage(from, '📄 Lagi bikin PDF...');

      try {
        const summary = getSummary(from, monthKey);
        if (!summary.txs.length) {
          return sendMessage(from, `📭 Belum ada transaksi bulan ini, PDF gak bisa dibuat.`);
        }

        const pdfBuffer = await generatePdf(from, monthKey, from);
        const mediaId = await uploadDocument(pdfBuffer, `laporan-keuangan-${monthKey}.pdf`);
        await sendDocument(from, mediaId, `laporan-keuangan-${monthKey}.pdf`,
          `💰 Laporan Keuangan ${formatMonth(monthKey)}\nTotal: ${summary.txs.length} transaksi`);
      } catch (e) {
        console.error('[UANG PDF]', e.message);
        await sendMessage(from, `⚠️ Gagal bikin PDF: ${e.message}`);
      }
      return;
    }

    // === HAPUS ===
    if (sub === 'hapus' || sub === 'del' || sub === 'delete') {
      const id = parseInt(args?.[1], 10);
      if (isNaN(id)) return sendMessage(from, '❌ Format: uang hapus <id>\n\nLihat id di `uang laporan`');
      const ok = deleteTransaction(from, id);
      return sendMessage(from, ok ? `✅ Transaksi #${id} dihapus.` : `❌ Transaksi #${id} gak ketemu.`);
    }

    // === RESET ===
    if (sub === 'reset') {
      setPending(`resetuang:${from}`, {});
      return sendMessage(from, '⚠️ *Konfirmasi:* Hapus SEMUA catatan keuangan kamu?\n\nKetik *Y* hapus, *N* batal.');
    }

    return sendMessage(from, `❌ Sub-command *${sub}* gak ada.\n\nKetik \`uang help\` buat liat command.`);
  },
};
