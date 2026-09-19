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
  name: 'pajak',
  alias: ['pph', 'pph21'],
  category: 'tools',
  description: 'Estimasi pajak PPh 21 (Indonesia)',

  async run({ from, args, sendMessage }) {
    const gaji = parseAmount(args?.[0]);
    const status = (args?.[1] || 'tk0').toUpperCase();

    if (!gaji) {
      return sendMessage(from,
        '💼 *KALKULATOR PAJAK PPh 21*\n\n' +
        '*Format:* `pajak <gaji_tahunan> [status]`\n\n' +
        '*Status:*\n' +
        '• `tk0` — Tidak kawin, 0 tanggungan (default)\n' +
        '• `k0` — Kawin, 0 tanggungan\n' +
        '• `k1` — Kawin, 1 anak\n' +
        '• `k2` — Kawin, 2 anak\n' +
        '• `k3` — Kawin, 3 anak\n\n' +
        '*Contoh:*\n' +
        '• `pajak 120jt` — gaji tahunan\n' +
        '• `pajak 120jt k2`'
      );
    }

    // PTKP 2024 (per tahun)
    const PTKP = {
      tk0: 54000000, k0: 58500000, k1: 63000000, k2: 67500000, k3: 72000000,
    };

    const ptkp = PTKP[status.toLowerCase()] || PTKP.tk0;
    const pkp = Math.max(0, gaji - ptkp);
    const pkpRounded = Math.floor(pkp / 1000) * 1000; // dibulatkan ke ribuan

    // Tarif progresif
    let pajak = 0;
    let sisa = pkpRounded;
    const brackets = [
      { batas: 60000000, rate: 0.05 },
      { batas: 250000000, rate: 0.15 },
      { batas: 500000000, rate: 0.25 },
      { batas: 5000000000, rate: 0.30 },
      { batas: Infinity, rate: 0.35 },
    ];

    const detail = [];
    for (const b of brackets) {
      if (sisa <= 0) break;
      const lapisan = Math.min(sisa, b.batas);
      const pajakLapisan = lapisan * b.rate;
      pajak += pajakLapisan;
      detail.push({ lapisan, rate: b.rate, pajak: pajakLapisan });
      sisa -= lapisan;
    }

    const persenEfektif = (pajak / gaji) * 100;
    const gajiPerBulan = gaji / 12;
    const pajakPerBulan = pajak / 12;
    const takeHome = gaji - pajak;

    let text = `💼 *ESTIMASI PAJAK PPh 21*\n\n`;
    text += `💰 Gaji setahun: ${formatRupiah(gaji)}\n`;
    text += `📋 Status: ${status}\n`;
    text += `📊 PTKP: ${formatRupiah(ptkp)}\n`;
    text += `📈 PKP (Penghasilan Kena Pajak): ${formatRupiah(pkpRounded)}\n\n`;

    text += `*Detail per lapisan:*\n`;
    for (const d of detail) {
      text += `• ${formatRupiah(d.lapisan)} × ${(d.rate * 100)}% = ${formatRupiah(d.pajak)}\n`;
    }

    text += `\n━━━━━━━━━━━━━━\n`;
    text += `💸 *Pajak setahun: ${formatRupiah(pajak)}*\n`;
    text += `📅 Pajak per bulan: ${formatRupiah(pajakPerBulan)}\n`;
    text += `📊 Rate efektif: ${persenEfektif.toFixed(2)}%\n\n`;
    text += `✅ *Take home pay/bulan: ${formatRupiah(gajiPerBulan - pajakPerBulan)}*\n\n`;
    text += `_⚠️ Estimasi kasar. Angka pasti konsultasi ke konsultan pajak._`;

    await sendMessage(from, text);
  },
};
