const QUOTES = [
  'Jangan tunda sampai besok apa yang bisa kamu kerjakan hari ini.',
  'Kegagalan adalah bumbu yang membuat kesuksesan terasa lebih nikmat.',
  'Orang yang berhenti belajar akan jadi pemilik masa lalu.',
  'Kalau kamu lelah, istirahat. Jangan menyerah.',
  'Setiap hari adalah kesempatan baru buat jadi versi terbaik diri kamu.',
  'Jangan bandingin proses kamu sama proses orang lain.',
  'Kesuksesan dimulai dari keberanian untuk mencoba.',
  'Hidup itu seperti sepeda, biar seimbang kamu harus terus bergerak.',
  'Mimpi besar dimulai dari langkah kecil.',
  'Waktu yang kamu buang buat ngeluh, bisa kamu pakai buat berubah.',
  'Jangan takut salah, takutlah kalau gak pernah nyoba.',
  'Sabar itu pahit, tapi buahnya manis.',
  'Rezeki gak akan ketuker, tenang aja.',
  'Jangan sibuk ngejar yang pergi, fokus sama yang bertahan.',
  'Kamu lebih kuat dari yang kamu kira.',
  'Setiap masalah pasti ada jalan keluarnya.',
  'Belajar dari kemarin, hidup untuk hari ini, berharap untuk besok.',
  'Kalau pintu tertutup, cari jendela. Kalau gak ada, bikin sendiri.',
  'Orang sukses gagal berkali-kali, tapi bangkit lebih banyak.',
  'Jangan tunggu sempurna, mulai aja dulu.',
  'Perjalanan seribu mil dimulai dari satu langkah.',
  'Yang penting bukan seberapa lambat, tapi jangan berhenti.',
  'Bahagia itu pilihan, bukan kebetulan.',
  'Kamu gak harus jadi sempurna buat jadi berharga.',
  'Fokus sama tujuan, bukan sama rintangan.',
];

module.exports = {
  name: 'quote',
  alias: ['quotes', 'motivasi'],
  category: 'fun',
  description: 'Quote motivasi random',

  async run({ from, sendMessage }) {
    const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    await sendMessage(from, `💬 _"${q}"_`);
  },
};
