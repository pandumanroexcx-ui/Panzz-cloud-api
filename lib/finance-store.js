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

// Parser angka: "2.5jt" / "500rb" / "15k" / "2500000"
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
  // WIB
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

// Generate PDF buffer
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

      // Ringkasan Box
      const boxY = doc.y;
      doc.rect(40, boxY, 515, 90).fillAndStroke('#ecf0f1', '#bdc3c7');
      doc.fillColor('#27ae60').fontSize(11).text('💰 Total Pemasukan', 60, boxY + 15);
      doc.fontSize(16).fillColor('#2c3e50').text(formatRupiah(summary.masuk), 60, boxY + 32);

      doc.fillColor('#e74c3c').fontSize(11).text('💸 Total Pengeluaran', 250, boxY + 15);
      doc.fontSize(16).fillColor('#2c3e50').text(formatRupiah(summary.keluar), 250, boxY + 32);

      doc.fillColor('#3498db').fontSize(11).text('📊 Saldo', 440, boxY + 15);
      doc.fontSize(16).fillColor(summary.saldo >= 0 ? '#27ae60' : '#e74c3c').text(formatRupiah(summary.saldo), 440, boxY + 32);

      doc.y = boxY + 110;

      // Tabel Header
      doc.fillColor('#34495e').fontSize(11).text('Detail Transaksi', 40, doc.y);
      doc.moveDown(0.5);

      const tableTop = doc.y;
      const colX = { no: 40, tgl: 70, ket: 150, masuk: 350, keluar: 460 };
      doc.fontSize(10).fillColor('#2c3e50');
      doc.rect(40, tableTop - 3, 515, 20).fill('#3498db');
      doc.fillColor('#fff').text('No', colX.no + 5, tableTop + 2);
      doc.fillColor('#fff').text('Tanggal', colX.tgl, tableTop + 2);
      doc.fillColor('#fff').text('Keterangan', colX.ket, tableTop + 2);
      doc.fillColor('#fff').text('Masuk', colX.masuk, tableTop + 2, { width: 100, align: 'right' });
      doc.fillColor('#fff').text('Keluar', colX.keluar, tableTop + 2, { width: 95, align: 'right' });

      let y = tableTop + 22;
      doc.fontSize(9);

      if (!summary.txs.length) {
        doc.fillColor('#7f8c8d').text('(Belum ada transaksi bulan ini)', 40, y + 5, { align: 'center', width: 515 });
        y += 20;
      } else {
        summary.txs.forEach((t, i) => {
          if (y > 750) {
            doc.addPage();
            y = 40;
          }
          const d = new Date(t.created_at);
          const wib = new Date(d.getTime() + 7 * 60 * 60 * 1000);
          const tgl = wib.toISOString().slice(0, 10);
          const ket = t.category ? `${t.category}${t.note ? ' - ' + t.note : ''}` : (t.note || '-');

          doc.fillColor('#2c3e50').text(String(i + 1), colX.no + 5, y);
          doc.fillColor('#2c3e50').text(tgl, colX.tgl, y);
          doc.fillColor('#2c3e50').text(ket.slice(0, 40), colX.ket, y, { width: 190 });

          if (t.type === 'masuk') {
            doc.fillColor('#27ae60').text(formatRupiah(t.amount), colX.masuk, y, { width: 100, align: 'right' });
          } else {
            doc.fillColor('#e74c3c').text(formatRupiah(t.amount), colX.keluar, y, { width: 95, align: 'right' });
          }
          y += 18;
          doc.moveTo(40, y - 4).lineTo(555, y - 4).strokeColor('#ecf0f1').stroke();
        });
      }

      doc.moveDown(2);
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
