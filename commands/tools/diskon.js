function formatRupiah(n) {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

module.exports = {
  name: 'diskon',
  alias: ['disc', 'promo'],
  category: 'tools',
  description: 'Hitung harga setelah diskon',

  async run({ from, args, sendMessage }) {
    const harga = parseFloat((args?.[0] || '').replace(/[^\d.]/g, ''));
    const diskon = parseFloat((args?.[1] || '').replace(/[^\d.]/g, ''));

    if (isNaN(harga) || isNaN(diskon)) {
      return sendMessage(from,
        '🏷️ *DISKON CALCULATOR*\n\n' +
        '*Format:* `diskon <harga> <diskon_%>`\n\n' +
        '*Contoh:*\n' +
        '• `diskon 200000 30` — diskon 30%\n' +
        '• `diskon 150000 50` — diskon 50%\n' +
        '• `diskon 1000000 25`'
      );
    }

    if (diskon < 0 || diskon > 100) return sendMessage(from, '❌ Diskon harus 0-100.');

    const potongan = harga * (diskon / 100);
    const bayar = harga - potongan;

    return sendMessage(from,
      `🏷️ *HASIL DISKON*\n\n` +
      `💵 Harga awal: ${formatRupiah(harga)}\n` +
      `🎯 Diskon: ${diskon}%\n` +
      `✂️ Potongan: ${formatRupiah(potongan)}\n\n` +
      `💰 *Bayar: ${formatRupiah(bayar)}*\n\n` +
      `💸 Hemat ${formatRupiah(potongan)}!`
    );
  },
};
