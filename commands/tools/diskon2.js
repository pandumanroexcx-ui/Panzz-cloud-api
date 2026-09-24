function formatRupiah(n) {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

module.exports = {
  name: 'diskon2',
  alias: ['diskonganda', 'diskonberturut'],
  category: 'tools',
  description: 'Hitung diskon bertingkat',

  async run({ from, args, sendMessage }) {
    if (args?.length < 2) {
      return sendMessage(from,
        '🏷️ *DISKON GANDA*\n\n' +
        '*Format:* `diskon2 <harga> <diskon1> <diskon2> ...`\n\n' +
        '*Contoh:*\n' +
        '• `diskon2 500000 20 10` — diskon 20% + 10%\n' +
        '• `diskon2 1000000 30 15 5` — 3 tingkat\n\n' +
        '_Rumus: harga × (1-d1%) × (1-d2%) × ..._'
      );
    }

    const harga = parseFloat(args[0].replace(/[^\d.]/g, ''));
    const diskons = args.slice(1).map(d => parseFloat(d.replace(/[^\d.]/g, ''))).filter(d => !isNaN(d));

    if (isNaN(harga) || !diskons.length) return sendMessage(from, '❌ Format salah.');
    if (diskons.some(d => d < 0 || d > 100)) return sendMessage(from, '❌ Diskon 0-100%.');

    let sisa = harga;
    let text = `🏷️ *HITUNG DISKON GANDA*\n\n`;
    text += `💰 Harga awal: ${formatRupiah(harga)}\n\n`;

    diskons.forEach((d, i) => {
      const potongan = sisa * (d / 100);
      sisa = sisa - potongan;
      text += `*${i + 1}.* Diskon ${d}% → ${formatRupiah(sisa)}\n`;
      text += `   _potong ${formatRupiah(potongan)}_\n\n`;
    });

    const totalHemat = harga - sisa;
    const persenTotal = (totalHemat / harga) * 100;

    text += `━━━━━━━━━━━━━━\n`;
    text += `✅ *Bayar: ${formatRupiah(sisa)}*\n`;
    text += `💸 Hemat: ${formatRupiah(totalHemat)} (${persenTotal.toFixed(1)}%)\n\n`;
    text += `_Bandingkan: kalau diskon digabung (${diskons.reduce((a, b) => a + b, 0)}%) → ${formatRupiah(harga * (1 - diskons.reduce((a, b) => a + b, 0) / 100))}_`;

    await sendMessage(from, text);
  },
};
