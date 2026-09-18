const AFIRMASI = [
  'Kamu lebih kuat dari yang kamu kira. 💪',
  'Hari ini berat, tapi kamu udah lewatin hari-hari berat sebelumnya. ✨',
  'Gak apa-apa istirahat, yang penting jangan berhenti. 🌱',
  'Kamu pantas dapet hal-hal baik di hidup ini. 🌸',
  'Satu langkah kecil hari ini, lebih baik dari seribu rencana esok. 👣',
  'Kamu gak harus sempurna buat jadi berharga. 💎',
  'Perasaan sedih itu valid, tapi jangan lupa kamu juga kuat. 🌊',
  'Proses kamu gak perlu dibandingin sama proses orang lain. 🍃',
  'Pelan-pelan aja, yang penting konsisten. 🐢',
  'Kamu udah hebat bisa sampai di titik ini. 🌟',
  'Kegagalan hari ini adalah pelajaran buat besok. 📚',
  'Kamu gak sendiri, ada banyak orang yang peduli. 🤝',
  'Jangan lupa bangga sama diri sendiri, sekecil apapun pencapaianmu. 🏆',
  'Hidup itu naik turun, dan kamu udah lewatin banyak turun. ⛰️',
  'Kamu berharga bukan karena pencapaian, tapi karena kamu adalah kamu. 💖',
  'Berhenti ngebandingin diri sendiri sama orang lain. Fokus sama progress kamu. 🎯',
  'Kalau capek, istirahat. Kalau siap, lanjut lagi. 🌙',
  'Hal-hal baik butuh waktu. Sabar ya. 🕰️',
  'Dunia butuh versi terbaik dari dirimu, bukan versi sempurna. 🌈',
  'Kamu berhak bahagia tanpa harus minta izin siapa pun. ☀️',
];

module.exports = {
  name: 'afirmasi',
  alias: ['semangat', 'motivasi', 'penyemangat'],
  category: 'fun',
  description: 'Kata-kata penyemangat random',

  async run({ from, sendMessage }) {
    const q = AFIRMASI[Math.floor(Math.random() * AFIRMASI.length)];
    await sendMessage(from, `💌 ${q}`);
  },
};
