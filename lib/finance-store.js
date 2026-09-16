const db = require('./db');
const PDFDocument = require('pdfkit');

const stmtInsert = db.prepare(
  'INSERT INTO finance (user_id, type, amount, category, note, date_str, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
);
const stmtGetMonth = db.prepare(
  'SELECT * FROM finance WHERE user_id = ? AND date_str LIKE ? ORDER BY created_at ASC'
);
const stmtGetAll = db.prepare('SELECT * FROM finance WHERE user_id = ? ORDER BY created_at DESC');
const stmtDelete = db.prepare('DELETE FROM finance WHERE id = ? AND user_id = ?');
const stmtReset = db.prepare('DELETE FROM finance WHERE user_id = ?');

function parseAmount(input) {
  if (!input) return null;
  let s = String(input).toLowerCase().replace(/[.,](?=\d{3})/g, '').replace(/\s/g, '');
  const match = s.match(/^(\d+(?:\.\d+)?)(jt|juta|rb|ribu|k|m)?$/);
  if (!match) return null;
  const num = parseFloat(match[1]);
  const unit = match[2];
  const multiplier = { jt: 1e6, juta: 1e6, rb: 1e3, ribu: 1e3, k: 1e3, m: 1e6 }[unit] || 1;
  return Math.round(num * multiplier);
}

function formatRupiah(num) {
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

      // Header
      doc.fontSize(20).fillColor('#2c3e50').text('LAPORAN KEUANGAN', { align: 'center' });
      doc.fontSize(12).fillColor('#7f8c8d').text(`Periode: ${monthName} ${y}`, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#95a5a6').text(`Dibuat: ${new Date().toLocaleString('id-ID')}`, { align: 'center' });
      doc.moveDown(1.5);

      // === RINGKASAN BOX ===
      const boxTop = doc.y;
      doc.rect(40, boxTop, 515, 90).fillAndStroke('#ecf0f1', '#bdc3c7');

      doc.fillColor('#27ae60').fontSize(11).text('💰 Total Pemasukan', 60, boxTop + 15);
      doc.fontSize(16).fillColor('#2c3e50').text(formatRupiah(summary.masuk), 60, boxTop + 32);

      doc.fillColor('#e74c3c').fontSize(11).text('💸 Total Pengeluaran', 250, boxTop + 15);
      doc.fontSize(16).fillColor('#2c3e50').text(formatRupiah(summary.keluar), 250, boxTop + 32);

      doc.fillColor('#3498db').fontSize(11).text('📊 Saldo', 440, boxTop + 15);
      doc.fontSize(16).fillColor(summary.saldo >= 0 ? '#27ae60' : '#e74c3c').text(formatRupiah(summary.saldo), 440, boxTop + 32);

      // Set posisi setelah box
      doc.y = boxTop + 110;

      // === TABEL HEADER ===
      doc.fillColor('#34495e').fontSize(11).text('Detail Transaksi', 40, doc.y);
      doc.moveDown(0.5);

      const tableTop = doc.y;
      const colNo = 45;
      const colTgl = 75;
      const colKet = 155;
      const colMasuk = 350;
      const colKeluar = 460;

      // Header row background
      doc.rect(40, tableTop - 3, 515, 20).fill('#3498db');

      // Header text
      doc.fillColor('#ffffff').fontSize(10);
      doc.text('No', colNo, tableTop + 3);
      doc.text('Tanggal', colTgl, tableTop + 3);
      doc.text('Keterangan', colKet, tableTop + 3);
      doc.text('Masuk', colMasuk, tableTop + 3, { width: 100, align: 'right' });
      doc.text('Keluar', colKeluar, tableTop + 3, { width: 95, align: 'right' });

      // === TABEL ROWS ===
      let rowY = tableTop + 25;
      doc.fontSize(9);

      if (!summary.txs.length) {
        doc.fillColor('#7f8c8d').text('(Belum ada transaksi bulan ini)', 40, rowY, { align: 'center', width: 515 });
      } else {
        for (let i = 0; i < summary.txs.length; i++) {
          if (rowY > 750) {
            doc.addPage();
            rowY = 40;
          }

          const t = summary.txs[i];
          const d = new Date(t.created_at + 7 * 60 * 60 * 1000);
          const tgl = `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
          const ket = (t.note || '-').slice(0, 40);

          doc.fillColor('#2c3e50').fontSize(9);
          doc.text(String(i + 1), colNo, rowY);
          doc.text(tgl, colTgl, rowY);
          doc.text(ket, colKet, rowY, { width: 190 });

          if (t.type === 'masuk') {
            doc.fillColor('#27ae60').text(formatRupiah(t.amount), colMasuk, rowY, { width: 100, align: 'right' });
            doc.fillColor('#2c3e50').text('-', colKeluar, rowY, { width: 95, align: 'right' });
          } else {
            doc.fillColor('#2c3e50').text('-', colMasuk, rowY, { width: 100, align: 'right' });
            doc.fillColor('#e74c3c').text(formatRupiah(t.amount), colKeluar, rowY, { width: 95, align: 'right' });
          }

          rowY += 18;
          doc.moveTo(40, rowY - 4).lineTo(555, rowY - 4).strokeColor('#ecf0f1').lineWidth(0.5).stroke();
        }
      }

      // === FOOTER ===
      doc.fontSize(9).fillColor('#95a5a6').text(
        `Total ${summary.txs.length} transaksi • Dibuat otomatis oleh PanzzBot`,
        40, 780, { align: 'center', width: 515 }
      );

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = {
  parseAmount, formatRupiah, getMonthKey,
  addTransaction, getMonthTransactions, getSummary,
  deleteTransaction, resetAll, generatePdf,
};
