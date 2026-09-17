const QUOTES = [
  { tokoh: 'Soekarno', quote: 'Beri aku 10 pemuda, niscaya akan kuguncangkan dunia.' },
  { tokoh: 'Soekarno', quote: 'Jangan sekali-kali meninggalkan sejarah.' },
  { tokoh: 'Soekarno', quote: 'Aku bukan pencipta Pancasila, aku hanya penggali Pancasila.' },
  { tokoh: 'Bung Hatta', quote: 'Kurang cerdas dapat diperbaiki dengan belajar, kurang cakap dapat dihilangkan dengan pengalaman. Namun tidak jujur itu sulit diperbaiki.' },
  { tokoh: 'Bung Hatta', quote: 'Indonesia merdeka karena kekuatan sendiri.' },
  { tokoh: 'Ki Hajar Dewantara', quote: 'Ing ngarsa sung tuladha, ing madya mangun karsa, tut wuri handayani.' },
  { tokoh: 'R.A. Kartini', quote: 'Habis gelap terbitlah terang.' },
  { tokoh: 'B.J. Habibie', quote: 'Kegagalan bukan akhir dari segalanya, tapi awal dari kesuksesan.' },
  { tokoh: 'B.J. Habibie', quote: 'Cinta tidak perlu diungkapkan dengan kata-kata, karena cinta ada di hati.' },
  { tokoh: 'Gus Dur', quote: 'Gitu aja kok repot.' },
  { tokoh: 'Gus Dur', quote: 'Tidak ada yang lebih membahagiakan daripada bisa membuat orang lain bahagia.' },
  { tokoh: 'Buya Hamka', quote: 'Kalau hidup sekedar hidup, babi di hutan juga hidup.' },
  { tokoh: 'Buya Hamka', quote: 'Tenggelamnya kapal van der Wijck adalah takdir, tapi patahnya hati itu karena pilihan.' },
  { tokoh: 'Chairil Anwar', quote: 'Aku ini binatang jalang, dari kumpulannya terbuang.' },
  { tokoh: 'Chairil Anwar', quote: 'Hidup hanya menunda kekalahan.' },
  { tokoh: 'Pramoedya Ananta Toer', quote: 'Orang boleh pandai setinggi langit, tapi selama ia tidak menulis, ia akan hilang di dalam masyarakat dan dari sejarah.' },
  { tokoh: 'Pramoedya Ananta Toer', quote: 'Sejarah bukan untuk diratapi, tapi untuk dijadikan pelajaran.' },
  { tokoh: 'Sujiwo Tejo', quote: 'Jangan jadi orang pintar, jadilah orang yang bermanfaat.' },
  { tokoh: 'Najwa Shihab', quote: 'Perempuan tidak harus cantik, yang penting punya pendirian.' },
  { tokoh: 'Najwa Shihab', quote: 'Jangan takut berbeda pendapat, takutlah kalau tidak punya pendapat.' },
  { tokoh: 'Andrea Hirata', quote: 'Bermimpilah setinggi langit, jika engkau jatuh, engkau akan jatuh di antara bintang-bintang.' },
  { tokoh: 'Dee Lestari', quote: 'Jangan menunggu waktu yang tepat, buatlah waktu itu menjadi tepat.' },
  { tokoh: 'Raditya Dika', quote: 'Jomblo itu bukan status, tapi pilihan hidup yang menyedihkan.' },
  { tokoh: 'Ernest Prakasa', quote: 'Hidup itu seperti komedi, kadang harus ketawa walau susah.' },
  { tokoh: 'Deddy Corbuzier', quote: 'Sukses itu bukan hasil, tapi proses yang konsisten.' },
  { tokoh: 'Raffi Ahmad', quote: 'Yang penting bahagia, gak usah mikirin omongan orang.' },
  { tokoh: 'Ariel Noah', quote: 'Hidup itu indah kalau kita bisa mensyukuri.' },
  { tokoh: 'Iwan Fals', quote: 'Orang kecil adalah orang besar yang tertidur.' },
  { tokoh: 'Slank', quote: 'Terlalu manis untuk dilupakan.' },
  { tokoh: 'Deddy Mizwar', quote: 'Jangan tanya apa yang negara berikan, tapi tanya apa yang kamu berikan.' },
];

module.exports = {
  name: 'quotetokoh',
  alias: ['tokohquote', 'katatokoh'],
  category: 'fun',
  description: 'Quote inspiratif dari tokoh terkenal',

  async run({ from, args, sendMessage }) {
    const filterTokoh = args.join(' ').toLowerCase();

    let pool = QUOTES;
    if (filterTokoh) {
      pool = QUOTES.filter(q => q.tokoh.toLowerCase().includes(filterTokoh));
      if (!pool.length) {
        const tokohList = [...new Set(QUOTES.map(q => q.tokoh))].sort();
        return sendMessage(from,
          `❌ Tokoh *${filterTokoh}* gak ada.\n\n` +
          `*Tokoh tersedia:*\n${tokohList.map(t => `• ${t}`).join('\n')}`
        );
      }
    }

    const pick = pool[Math.floor(Math.random() * pool.length)];
    await sendMessage(from, `💭 _"${pick.quote}"_\n\n— *${pick.tokoh}*`);
  },
};
