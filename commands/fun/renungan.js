const RENUNGAN = [
  'Bersyukur atas hal kecil hari ini, karena kebahagiaan dibangun dari hal-hal sederhana.',
  'Setiap pagi adalah kesempatan baru untuk memulai lagi. Jangan sia-siakan.',
  'Orang yang sabar akan menuai hasil terbaik pada waktunya.',
  'Kasih sayang kepada sesama adalah bahasa universal yang semua orang mengerti.',
  'Kebaikan yang kamu tanam hari ini, akan berbuah di waktu yang tepat.',
  'Jangan bandingkan perjalananmu dengan orang lain. Setiap orang punya waktu masing-masing.',
  'Kekuatan sejati bukan tentang tidak pernah jatuh, tapi tentang bangkit setiap kali jatuh.',
  'Hidup yang berarti adalah hidup yang memberi makna bagi orang lain.',
  'Maafkan dirimu sendiri dulu, sebelum kamu bisa memaafkan orang lain.',
  'Harta paling berharga bukan uang, tapi waktu bersama orang tersayang.',
  'Jangan takut berbeda. Justru perbedaan yang membuat dunia ini indah.',
  'Kata-kata baik tidak butuh biaya, tapi dampaknya bisa mengubah hidup seseorang.',
  'Bahagia itu bukan tujuan, tapi cara kita menjalani hidup setiap hari.',
  'Orang yang rendah hati selalu punya tempat di hati banyak orang.',
  'Apa yang kamu tanam, itu yang akan kamu tuai. Tanamlah hal-hal baik.',
  'Jangan menunda kebaikan, karena kesempatan tidak selalu datang dua kali.',
  'Cinta yang tulus tidak mengharapkan balasan.',
  'Setiap masalah adalah guru yang mengajarkan kita sesuatu yang baru.',
  'Jadilah alasan seseorang tersenyum hari ini.',
  'Damai sejahtera dimulai dari hati yang tenang dan penuh syukur.',
  'Kekayaan sejati adalah kesehatan, keluarga, dan sahabat yang setia.',
  'Jangan biarkan kemarin mengambil terlalu banyak dari hari ini.',
  'Hal-hal besar dimulai dari langkah-langkah kecil yang konsisten.',
  'Senyummu bisa jadi penyelamat hari seseorang. Bagikan sebanyak mungkin.',
  'Tidak ada yang terlalu sulit jika kita percaya dan berusaha.',
  'Hidup ini singkat, isi dengan hal-hal yang membuatmu bangga.',
  'Ketika kamu merasa sendiri, ingatlah ada yang selalu peduli padamu.',
  'Jangan tunggu sempurna untuk memulai. Mulai aja dulu, nanti belajar sambil jalan.',
  'Berbuat baiklah tanpa mengharap imbalan, dan kamu akan menemukan kebahagiaan sejati.',
  'Semua yang terjadi dalam hidupmu punya tujuan. Percayalah pada prosesnya.',
];

module.exports = {
  name: 'renungan',
  alias: ['katabijak', 'mutiara', 'hikmah'],
  category: 'fun',
  description: 'Kata-kata bijak & renungan universal',

  async run({ from, sendMessage }) {
    const pick = RENUNGAN[Math.floor(Math.random() * RENUNGAN.length)];
    await sendMessage(from, `🌅 *RENUNGAN HARI INI*\n\n_"${pick}"_`);
  },
};
