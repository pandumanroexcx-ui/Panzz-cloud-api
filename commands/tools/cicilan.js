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
  name: 'cicilan',
  alias: ['kredit', 'angsuran'],
  category: 'tools',
  description: 'Hitung cicilan kredit/utang',

  async run({ from, args, sendMessage }) {
    if (args?.length < 3) {
      return sendMessage(from,
        '💳 *KALKULATOR CICILAN*\n\n' +
        '*Format:* `cicilan <harga> <DP> <tenor_bulan> [bunga_%_tahun]`\n\n' +
        '*Contoh:*\n' +
        '• `cicilan 10jt 2jt 12` — tanpa bunga\n' +
        '• `cicilan 200jt 20jt 60 6` — bunga 6%/tahun\n' +
        '• `cicilan 5000000 0 12 2` — mobil/motor\n\n' +
        '_Bunga default 0% (flat). Kalo bunga tahunan, masukan sebagai arg ke-4._'
      );
    }

    const pokok = parseAmount(args[0]);
    const dp = parseAmount(args[1]);
    const tenor = parseInt(args[2], 10);
    const bungaTahunan = parseFloat(args[3]) || 0;

    if (!pokok || !dp === undefined || isNaN(tenor)) {
      return sendMessage(from, '❌ Format salah. Cek contoh: `cicilan 10jt 2jt 12`');
    }
    if (pokok <= 0 || tenor < 1 || tenor > 360) {
      return sendMessage(from, '❌ Angka gak valid (tenor 1-360 bulan).');
    }
    if (dp >= pokok) return sendMessage(from, '❌ DP gak boleh >= harga.');

    const utang = pokok - dp;
    let totalBayar, cicilan;

    if (bungaTahunan > 0) {
      // Bunga flat sederhana: total bunga = utang × (bunga/100) × (tenor/12)
      const totalBunga = utang * (bungaTahunan / 100) * (tenor / 12);
      totalBayar = utang + totalBunga;
      cicilan = totalBayar / tenor;
    } else {
      totalBayar = utang;
      cicilan = utang / tenor;
    }

    const totalSemua = dp + totalBayar;

    let text = `💳 *SIMULASI CICILAN*\n\n`;
    text += `💰 Harga: ${formatRupiah(pokok)}\n`;
    text += `📥 DP: ${formatRupiah(dp)} (${((dp/pokok)*100).toFixed(1)}%)\n`;
    text += `📋 Utang: ${formatRupiah(utang)}\n`;
    text += `📅 Tenor: ${tenor} bulan\n`;
    if (bungaTahunan > 0) {
      text += `📊 Bunga: ${bungaTahunan}%/tahun (flat)\n`;
      text += `💵 Total Bunga: ${formatRupiah(totalBayar - utang)}\n`;
    }
    text += `\n━━━━━━━━━━━━━━\n`;
    text += `✅ *Cicilan/bulan: ${formatRupiah(cicilan)}*\n`;
    text += `💸 *Total bayar: ${formatRupiah(totalSemua)}*\n`;

    await sendMessage(from, text);
  },
};
