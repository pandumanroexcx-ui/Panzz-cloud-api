function formatRupiah(n) {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

module.exports = {
  name: 'split',
  alias: ['bagitagihan', 'patungan'],
  category: 'tools',
  description: 'Bagi tagihan rata',

  async run({ from, args, sendMessage }) {
    const total = parseFloat((args?.[0] || '').replace(/[^\d.]/g, ''));
    const orang = parseInt(args?.[1], 10);
    const persen = args?.[2] ? parseInt(args[2], 10) : null;

    if (isNaN(total) || isNaN(orang) || orang < 1) {
      return sendMessage(from,
        '🧾 *SPLIT BILL*\n\n' +
        '*Format:* `split <total> <jumlah_orang> [pajak_%]`\n\n' +
        '*Contoh:*\n' +
        '• `split 500000 5` — bagi rata 5 orang\n' +
        '• `split 300000 3 10` — + pajak 10%\n' +
        '• `split 250000 4 5` — + service 5%'
      );
    }

    const pajak = persen ? total * (persen / 100) : 0;
    const grandTotal = total + pajak;
    const perOrang = grandTotal / orang;

    let text = `🧾 *SPLIT BILL*\n\n`;
    text += `💰 Total: ${formatRupiah(total)}\n`;
    if (pajak > 0) text += `📊 Pajak/Service (${persen}%): ${formatRupiah(pajak)}\n`;
    text += `💵 Grand Total: *${formatRupiah(grandTotal)}*\n`;
    text += `👥 Jumlah orang: ${orang}\n\n`;
    text += `✅ *Per orang: ${formatRupiah(perOrang)}*`;

    return sendMessage(from, text);
  },
};
