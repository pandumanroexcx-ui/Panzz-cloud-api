function hitungBMI(berat, tinggiCm) {
  const tinggiM = tinggiCm / 100;
  return berat / (tinggiM * tinggiM);
}

function kategoriBMI(bmi) {
  if (bmi < 18.5) return { label: 'Kurus (Underweight)', emoji: '⚠️' };
  if (bmi < 25) return { label: 'Normal (Ideal)', emoji: '✅' };
  if (bmi < 30) return { label: 'Kelebihan Berat (Overweight)', emoji: '⚠️' };
  return { label: 'Obesitas', emoji: '🚨' };
}

function hitungBMR(berat, tinggi, umur, gender) {
  // Mifflin-St Jeor
  if (gender === 'pria' || gender === 'l' || gender === 'm') {
    return 10 * berat + 6.25 * tinggi - 5 * umur + 5;
  }
  return 10 * berat + 6.25 * tinggi - 5 * umur - 161;
}

function hitungKalori(bmr, aktivitas) {
  const mult = {
    'duduk': 1.2, 'sedentary': 1.2, 'ringan': 1.375, 'light': 1.375,
    'sedang': 1.55, 'moderate': 1.55, 'aktif': 1.725, 'active': 1.725,
    'sangat': 1.9, 'atlet': 1.9, 'extreme': 1.9,
  }[aktivitas] || 1.375;
  return bmr * mult;
}

function hitungIdealTinggi(tinggiCm, gender) {
  // Rumus Broca
  if (gender === 'pria' || gender === 'l' || gender === 'm') {
    return tinggiCm - 100 - ((tinggiCm - 100) * 0.1);
  }
  return tinggiCm - 100 - ((tinggiCm - 100) * 0.15);
}

module.exports = {
  name: 'bmi',
  alias: ['health', 'kesehatan', 'kalori'],
  category: 'tools',
  description: 'Hitung BMI, BMR, kalori harian',

  async run({ from, args, sendMessage }) {
    if (!args?.[0] || args[0].toLowerCase() === 'help') {
      return sendMessage(from,
        '💊 *HEALTH CALCULATOR*\n\n' +
        '*Format:* `bmi <berat> <tinggi> [umur] [gender] [aktivitas]`\n\n' +
        '*Contoh:*\n' +
        '• `bmi 65 170` — BMI aja\n' +
        '• `bmi 65 170 25 pria sedang` — lengkap\n' +
        '• `bmi 50 160 22 wanita ringan`\n\n' +
        '*Gender:* pria / wanita\n' +
        '*Aktivitas:* duduk, ringan, sedang, aktif, atlet'
      );
    }

    const berat = parseFloat(args[0]);
    const tinggi = parseFloat(args[1]);
    const umur = parseInt(args[2], 10) || null;
    const gender = (args[3] || '').toLowerCase();
    const aktivitas = (args[4] || 'ringan').toLowerCase();

    if (isNaN(berat) || isNaN(tinggi)) {
      return sendMessage(from, '❌ Format: `bmi <berat_kg> <tinggi_cm> [umur] [gender] [aktivitas]`\n\nContoh: `bmi 65 170`');
    }
    if (berat < 20 || berat > 300) return sendMessage(from, '❌ Berat gak wajar (20-300 kg).');
    if (tinggi < 100 || tinggi > 250) return sendMessage(from, '❌ Tinggi gak wajar (100-250 cm).');

    const bmi = hitungBMI(berat, tinggi);
    const kategori = kategoriBMI(bmi);
    const ideal = hitungIdealTinggi(tinggi, gender || 'pria');

    let text = `💊 *HASIL KESEHATAN*\n\n`;
    text += `📊 *BMI (Body Mass Index):*\n`;
    text += `• Nilai: *${bmi.toFixed(1)}*\n`;
    text += `• Kategori: ${kategori.emoji} *${kategori.label}*\n\n`;

    text += `⚖️ *Berat Ideal (Broca):*\n`;
    text += `• Ideal: *${ideal.toFixed(1)} kg*\n`;
    text += `• Kamu: ${berat} kg (${berat > ideal ? `+${(berat - ideal).toFixed(1)} kg` : `${(berat - ideal).toFixed(1)} kg`})\n\n`;

    if (umur && (gender === 'pria' || gender === 'wanita' || gender === 'l' || gender === 'p' || gender === 'm' || gender === 'f')) {
      const bmr = hitungBMR(berat, tinggi, umur, gender);
      const kalori = hitungKalori(bmr, aktivitas);
      text += `🔥 *BMR (Basal Metabolic Rate):*\n`;
      text += `• ${Math.round(bmr)} kalori/hari (istirahat)\n\n`;
      text += `🍽️ *Kebutuhan Kalori Harian:*\n`;
      text += `• Aktivitas ${aktivitas}: *${Math.round(kalori)} kalori/hari*\n\n`;
      text += `💡 *Tips:*\n`;
      text += `• Turun berat: ${Math.round(kalori - 500)} kalori/hari\n`;
      text += `• Naik berat: ${Math.round(kalori + 500)} kalori/hari\n`;
    } else if (umur || gender) {
      text += `ℹ️ _Isi umur + gender buat dapet BMR & kalori harian._\n`;
    }

    text += `\n_⚠️ Hasil ini cuma estimasi. Konsultasi dokter buat saran medis._`;

    return sendMessage(from, text);
  },
};
