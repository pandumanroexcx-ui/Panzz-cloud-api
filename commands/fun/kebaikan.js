const KEBAIKAN = [
  'Kirim pesan penyemangat ke 1 orang di kontakmu.',
  'Beri pujian tulus ke orang yang kamu temui hari ini.',
  'Traktir makan teman/kolega hari ini.',
  'Donasi ke panti asuhan / panti jompo terdekat.',
  'Bantu orang tua/keluarga beresin rumah.',
  'Telepon kakek/nenek, tanya kabar.',
  'Berikan senyum ke orang asing yang kamu temui.',
  'Beli makanan/minuman buat satpam/ojol.',
  'Tulis pesan terima kasih ke guru/teman lama.',
  'Donasikan pakaian layak pakai.',
  'Beri tips lebih buat pelayan/driver.',
  'Bantu tetangga yang lagi kesusahan.',
  'Tanam pohon/pelihara tanaman hijau.',
  'Adopsi hewan terlantar (atau donasi ke shelter).',
  'Beri 5 bintang + review positif ke UMKM langgananmu.',
  'Bantu teman belajar/kerja sesuatu.',
  'Kirim makanan ke pos keamanan setempat.',
  'Bersihin meja makan setelah makan bareng.',
  'Jemput teman yang kehujanan.',
  'Dengerin curhat teman tanpa ngasih solusi.',
  'Share info lowongan kerja ke yang butuh.',
  'Beli produk dari UMKM lokal.',
  'Masak buat keluarga tanpa diminta.',
  'Kirim kartu ucapan fisik ke orang tersayang.',
  'Beresin sampah yang kamu temuin di jalan.',
];

module.exports = {
  name: 'kebaikan',
  alias: ['kindness', 'actkind'],
  category: 'fun',
  description: 'Ide act of kindness random',

  async run({ from, sendMessage }) {
    const pick = KEBAIKAN[Math.floor(Math.random() * KEBAIKAN.length)];
    await sendMessage(from, `💝 *KEBAIKAN HARI INI*\n\n${pick}\n\n_Lakuin ya, sekecil apapun itu berarti!_ 🌱`);
  },
};
