const db = require('./db');
const PDFDocument = require('pdfkit');

const stmtInsert = db.prepare(
  'INSERT INTO finance (user_id, type, amount, category, note, date_str, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
);
const stmtGetMonth = db.prepare(
  'SELECT * FROM finance WHERE user_id = ? AND date_str LIKE ? ORDER BY created_at ASC'
);
const stmtDelete = db.prepare('DELETE FROM finance WHERE id = ? AND user_id = ?');
const stmtReset = db.prepare('DELETE FROM finance WHERE user_id = ?');

// Parser angka: HARUS ada angka di depan
function parseAmount(input) {
  if (!input) return null;
  let s = String(input).toLowerCase().trim().replace(/\s/g, '');

  // Hapus titik ribuan kalau gak ada huruf
  if (!/[a-z]/.test(s)) {
    s = s.replace(/\./g, '');
  }

  const match = s.match(/^(\d+(?:[.,]\d+)?)(jt|juta|rb|ribu|k|m)?$/);
  if (!match) return null;

  const num = parseFloat(match[1].replace(',', '.'));
  if (isNaN(num) || num <= 0) return null;

  const unit = match[2];
  const multiplier = { jt: 1e6, juta: 1e6, rb: 1e3, ribu: 1e3, k: 1e3, m: 1e6 }[unit] || 1;
  return Math.round(num * multiplier);
}

// Format SINGKAT buat chat: Rp 10,5jt / Rp 500rb
function formatRupiah(num) {
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  function fmt(n, unit) {
    let val = n.toFixed(1);
    if (val.endsWith('.0')) val = val.slice(0, -2);
    return `${sign}Rp ${val.replace('.', ',')}${unit}`;
  }

  if (abs >= 1e12) return fmt(abs / 1e12, 'T');
  if (abs >= 1e9) return fmt(abs / 1e9, 'M');
  if (abs >= 1e6) return fmt(abs / 1e6, 'jt');
  if (abs >= 1e3) return fmt(abs / 1e3, 'rb');
  return `${sign}Rp ${abs}`;
}

// Format LENGKAP buat PDF: Rp 10.500.000
function formatRupiahFull(num) {
  return 'Rp ' + Math.abs(num).toLocaleString('id-ID');
}

function getMonthKey(date = new Date()) {
  const wib = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const y = wib.getUTCFullYear();
  const m = String(wib.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function addTransaction(userId, type, amount, category, note) {
  const now = new Date();
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const dateStr = wib.toISOString().slice(0, 10);
  const info = stmtInsert.run(userId, type, amount, category || null, note || null, dateStr, Date.now());
  return info.lastInsertRowid;
}

function getMonthTransactions(userId, monthKey) {
  return stmtGetMonth.all(userId, `${monthKey}%`);
}

function getSummary(userId, monthKey) {
  const txs = getMonthTransactions(userId, monthKey);
  let masuk = 0, keluar = 0;
  for (const t of txs) {
    if (t.type === 'masuk') masuk += t.amount;
    else keluar += t.amount;
  }
  return { masuk, keluar, saldo: masuk - keluar, txs };
}

function deleteTransaction(userId, id) {
  return stmtDelete.run(id, userId).changes > 0;
}

function resetAll(userId) {
  return stmtReset.run(userId).changes;
}

// PDF TANPA EMOJI — pakai text biasa
async function generatePdf(userId, monthKey, userName) {
  const summary = getSummary(userId, monthKey);
  const [y, m] = monthKey.split('-');
  const monthName = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'][parseInt(m) - 1];

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks = [];
      doc.on('data', c => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // HEADER
      doc.fontSize(20).fillColor('#2c3e50').text('LAPORAN KEUANGAN', { align: 'center' });
      doc.fontSize(12).fillColor('#7f8c8d').text(`Periode: ${monthName} ${y}`, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#95a5a6').text(`Dibuat: ${new Date().toLocaleString('id-ID')}`, { align: 'center' });
      doc.moveDown(1.5);

      // === RINGKASAN BOX ===
      const boxTop = doc.y;
      const boxHeight = 90;

      // Background kotak
      doc.rect(40, boxTop, 515, boxHeight).fillAndStroke('#ecf0f1', '#bdc3c7');

      // Kolom 1 — Pemasukan
      doc.fillColor('#27ae60').fontSize(10).text('TOTAL PEMASUKAN', 55, boxTop + 15, { width: 160 });
      doc.fillColor('#2c3e50').fontSize(15).text(formatRupiahFull(summary.masuk), 55, boxTop + 35, { width: 160 });

      // Kolom 2 — Pengeluaran
      doc.fillColor('#e74c3c').fontSize(10).text('TOTAL PENGELUARAN', 220, boxTop + 15, { width: 160 });
      doc.fillColor('#2c3e50').fontSize(15).text(formatRupiahFull(summary.keluar), 220, boxTop + 35, { width: 160 });

      // Kolom 3 — Saldo
      doc.fillColor('#3498db').fontSize(10).text('SALDO AKHIR', 390, boxTop + 15, { width: 150 });
      doc.fillColor(summary.saldo >= 0 ? '#27ae60' : '#e74c3c').fontSize(15).text(formatRupiahFull(summary.saldo), 390, boxTop + 35, { width: 150 });

      doc.y = boxTop + boxHeight + 20;

      // === JUDUL TABEL ===
      doc.fillColor('#34495e').fontSize(11).text('DETAIL TRANSAKSI', 40, doc.y);
      doc.moveDown(0.7);

      // === TABEL ===
      const tableTop = doc.y;
      const colNo = 45;
      const colTgl = 75;
      const colKet = 160;
      const colMasuk = 355;
      const colKeluar = 465;

      // Header row
      doc.rect(40, tableTop - 3, 515, 22).fill('#3498db');
      doc.fillColor('#ffffff').fontSize(10);
      doc.text('No', colNo, tableTop + 4, { width: 25 });
      doc.text('Tanggal', colTgl, tableTop + 4, { width: 80 });
      doc.text('Keterangan', colKet, tableTop + 4, { width: 190 });
      doc.text('Masuk', colMasuk, tableTop + 4, { width: 100, align: 'right' });
      doc.text('Keluar', colKeluar, tableTop + 4, { width: 85, align: 'right' });

      // Rows
      let rowY = tableTop + 28;
      doc.fontSize(9);

      if (!summary.txs.length) {
        doc.fillColor('#7f8c8d').text('(Belum ada transaksi bulan ini)', 40, rowY + 5, { align: 'center', width: 515 });
      } else {
        for (let i = 0; i < summary.txs.length; i++) {
          if (rowY > 740) { doc.addPage(); rowY = 40; }

          const t = summary.txs[i];
          const d = new Date(t.created_at + 7 * 60 * 60 * 1000);
          const tgl = `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`;
          const ket = (t.note || '-').slice(0, 42);

          doc.fillColor('#2c3e50').fontSize(9);
          doc.text(String(i + 1), colNo, rowY, { width: 25 });
          doc.text(tgl, colTgl, rowY, { width: 80 });
          doc.text(ket, colKet, rowY, { width: 190 });

          if (t.type === 'masuk') {
            doc.fillColor('#27ae60').text(formatRupiahFull(t.amount), colMasuk, rowY, { width: 100, align: 'right' });
            doc.fillColor('#95a5a6').text('-', colKeluar, rowY, { width: 85, align: 'right' });
          } else {
            doc.fillColor('#95a5a6').text('-', colMasuk, rowY, { width: 100, align: 'right' });
            doc.fillColor('#e74c3c').text(formatRupiahFull(t.amount), colKeluar, rowY, { width: 85, align: 'right' });
          }

          rowY += 20;
          doc.moveTo(40, rowY - 6).lineTo(555, rowY - 6).strokeColor('#ecf0f1').lineWidth(0.5).stroke();
        }

        // TOTAL row
        doc.moveTo(40, rowY + 2).lineTo(555, rowY + 2).strokeColor('#34495e').lineWidth(1).stroke();
        rowY += 10;
        doc.fillColor('#34495e').fontSize(10).text('TOTAL', colKet, rowY, { width: 190 });
        doc.fillColor('#27ae60').text(formatRupiahFull(summary.masuk), colMasuk, rowY, { width: 100, align: 'right' });
        doc.fillColor('#e74c3c').text(formatRupiahFull(summary.keluar), colKeluar, rowY, { width: 85, align: 'right' });
      }

      // FOOTER
      doc.fontSize(8).fillColor('#95a5a6').text(
        `Total ${summary.txs.length} transaksi  |  Dibuat otomatis oleh PanzzBot`,
        40, 800, { align: 'center', width: 515 }
      );

      doc.end();
    } catch (e) { reject(e); }
  });
}

module.exports = {
  parseAmount, formatRupiah, formatRupiahFull, getMonthKey,
  addTransaction, getMonthTransactions, getSummary,
  deleteTransaction, resetAll, generatePdf,
};
