function parseAmount(input) {
  if (!input) return null;
  let s = String(input).toLowerCase().replace(/[.,](?=\d{3})/g, '').replace(/\s/g, '');
  const match = s.match(/^(\d+(?:\.\d+)?)(jt|juta|rb|ribu|k|m)?$/);
  if (!match) return null;
  const num = parseFloat(match[1]);
  const mult = { jt: 1e6, juta: 1e6, rb: 1e3, ribu: 1e3, k: 1e3, m: 1e6 }[match[2]] || 1;
  return Math.round(num * mult);
}

function formatRupiah(n) {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

module.exports = {
  name: 'zakat',
  alias: ['zakatt', 'sedekah'],
  category: 'tools',
  description: 'Hitung zakat mal & fitrah',

  async run({ from, args, sendMessage }) {
    const sub = (args?.[0] || '').toLowerCase();

    if (!sub || sub === 'help') {
      return sendMessage(from,
        '🕌 *HITUNG ZAKAT*\n\n' +
        '• `zakat mal <harta>` — zakat mal (2.5%)\n' +
        '• `zakat fitrah <jumlah_orang>` — zakat fitrah\n' +
        '• `zakat penghasilan <gaji_bulanan>` — zakat penghasilan (2.5%)\n\n' +
        '*Contoh:*\n' +
        '• `zakat mal 100jt`\n' +
        '• `zakat fitrah 4`\n' +
        '• `zakat penghasilan 8jt`\n\n' +
        '_Nisab zakat mal ≈ 85 gram emas ≈ Rp 85jt_'
      );
    }

    if (sub === 'mal') {
      const harta = parseAmount(args[1]);
      if (!harta) return sendMessage(from, '❌ Format: `zakat mal 100jt`');

      const nisab = 85000000;
      if (harta < nisab) {
        return sendMessage(from,
          `🕌 *ZAKAT MAL*\n\n` +
          `💰 Harta: ${formatRupiah(harta)}\n` +
          `📊 Nisab: ${formatRupiah(nisab)}\n\n` +
          `⚠️ Harta kamu *belum mencapai nisab*. Gak wajib zakat mal.\n\n` +
          `_Tapi tetep bisa sedekah seikhlasnya ya!_`
        );
      }

      const zakat = harta * 0.025;
      return sendMessage(from,
        `🕌 *ZAKAT MAL*\n\n` +
        `💰 Harta: ${formatRupiah(harta)}\n` +
        `📊 Nisab: ${formatRupiah(nisab)} ✅\n` +
        `💵 Zakat (2.5%): *${formatRupiah(zakat)}*\n\n` +
        `_Salurkan ke 8 asnaf (fakir, miskin, amil, dll)._`
      );
    }

    if (sub === 'fitrah') {
      const orang = parseInt(args[1], 10);
      if (isNaN(orang) || orang < 1) return sendMessage(from, '❌ Format: `zakat fitrah 4`\n\n_Angka = jumlah orang_');

      const perOrang = 45000;
      const total = perOrang * orang;

      return sendMessage(from,
        `🕌 *ZAKAT FITRAH*\n\n` +
        `👥 Jumlah: ${orang} orang\n` +
        `💵 Per orang: ${formatRupiah(perOrang)} (≈ 3.5 liter beras)\n` +
        `💰 *Total: ${formatRupiah(total)}*\n\n` +
        `_Dibayar sebelum sholat Idul Fitri._`
      );
    }

    if (sub === 'penghasilan' || sub === 'gaji') {
      const gaji = parseAmount(args[1]);
      if (!gaji) return sendMessage(from, '❌ Format: `zakat penghasilan 8jt`');

      const nisabBulanan = 7083333;
      if (gaji < nisabBulanan) {
        return sendMessage(from,
          `🕌 *ZAKAT PENGHASILAN*\n\n` +
          `💰 Gaji: ${formatRupiah(gaji)}/bulan\n` +
          `📊 Nisab: ${formatRupiah(nisabBulanan)}/bulan\n\n` +
          `⚠️ Gaji belum mencapai nisab. Gak wajib zakat penghasilan.`
        );
      }

      const zakat = gaji * 0.025;
      return sendMessage(from,
        `🕌 *ZAKAT PENGHASILAN*\n\n` +
        `💰 Gaji: ${formatRupiah(gaji)}/bulan\n` +
        `📊 Nisab: ${formatRupiah(nisabBulanan)} ✅\n` +
        `💵 Zakat (2.5%): *${formatRupiah(zakat)}*/bulan\n\n` +
        `_Bisa ditunaikan tiap bulan atau digabung setahun._`
      );
    }

    return sendMessage(from, `❌ Sub-command *${sub}* gak ada. Ketik \`zakat help\`.`);
  },
};
