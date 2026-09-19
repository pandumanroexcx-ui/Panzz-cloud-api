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

module.exports = {
  name: 'tabungan',
  alias: ['saving', 'targetnabung'],
  category: 'tools',
  description: 'Hitung target tabungan',

  async run({ from, args, sendMessage }) {
    const sub = (args?.[0] || '').toLowerCase();

    if (sub === 'target') {
      // tabungan target <jumlah> <bulan>
      const target = parseAmount(args[1]);
      const bulan = parseInt(args[2], 10);
      if (!target || isNaN(bulan) || bulan < 1) {
        return sendMessage(from, '❌ Format: `tabungan target <jumlah> <bulan>`\nContoh: `tabungan target 10jt 12`');
      }
      const perBulan = target / bulan;
      const perHari = target / (bulan * 30);
      const perMinggu = target / (bulan * 4);
      return sendMessage(from,
        `💰 *TARGET TABUNGAN*\n\n` +
        `🎯 Target: ${formatRupiah(target)}\n` +
        `⏱️ Waktu: ${bulan} bulan\n\n` +
        `💵 *Nabung per bulan: ${formatRupiah(perBulan)}*\n` +
        `📅 Per minggu: ${formatRupiah(perMinggu)}\n` +
        `🌅 Per hari: ${formatRupiah(perHari)}\n\n` +
        `_Semangat nabung! 🚀_`
      );
    }

    if (sub === 'estimasi') {
      // tabungan estimasi <per_bulan> <bulan>
      const perBulan = parseAmount(args[1]);
      const bulan = parseInt(args[2], 10);
      if (!perBulan || isNaN(bulan) || bulan < 1) {
        return sendMessage(from, '❌ Format: `tabungan estimasi <per_bulan> <bulan>`\nContoh: `tabungan estimasi 500rb 24`');
      }
      const total = perBulan * bulan;
      const perHari = perBulan / 30;
      return sendMessage(from,
        `💰 *ESTIMASI TABUNGAN*\n\n` +
        `💵 Nabung: ${formatRupiah(perBulan)}/bulan\n` +
        `⏱️ Waktu: ${bulan} bulan\n\n` +
        `🎯 *Total terkumpul: ${formatRupiah(total)}*\n` +
        `📅 Per hari setara: ${formatRupiah(perHari)}`
      );
    }

    if (sub === 'bunga') {
      // tabungan bunga <modal> <bunga_%_tahun> <tahun>
      const modal = parseAmount(args[1]);
      const bunga = parseFloat(args[2]);
      const tahun = parseInt(args[3], 10);
      if (!modal || isNaN(bunga) || isNaN(tahun)) {
        return sendMessage(from, '❌ Format: `tabungan bunga <modal> <bunga_%_tahun> <tahun>`\nContoh: `tabungan bunga 10jt 5 3`');
      }
      const akhir = modal * Math.pow(1 + bunga / 100, tahun);
      const untung = akhir - modal;
      return sendMessage(from,
        `💰 *TABUNGAN BERBUNGA*\n\n` +
        `💵 Modal awal: ${formatRupiah(modal)}\n` +
        `📊 Bunga: ${bunga}%/tahun\n` +
        `⏱️ Periode: ${tahun} tahun\n\n` +
        `🎯 *Hasil akhir: ${formatRupiah(akhir)}*\n` +
        `📈 Untung bunga: ${formatRupiah(untung)}\n\n` +
        `_Compound interest (bunga berbunga)_`
      );
    }

    return sendMessage(from,
      '💰 *KALKULATOR TABUNGAN*\n\n' +
      '• `tabungan target <jumlah> <bulan>` — hitung nabung/bulan\n' +
      '  Contoh: `tabungan target 10jt 12`\n\n' +
      '• `tabungan estimasi <per_bulan> <bulan>` — proyeksi\n' +
      '  Contoh: `tabungan estimasi 500rb 24`\n\n' +
      '• `tabungan bunga <modal> <%_tahun> <tahun>` — compound interest\n' +
      '  Contoh: `tabungan bunga 10jt 5 3`'
    );
  },
};
