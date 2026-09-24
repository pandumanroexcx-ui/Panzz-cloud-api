const DOA = [
  { judul: 'Doa Pagi', isi: 'Bapa yang di surga, terima kasih atas penyertaan-Mu sepanjang malam. Bimbing langkahku hari ini, jadikan aku berkat bagi sesama. Amin.' },
  { judul: 'Doa Sebelum Tidur', isi: 'Tuhan, terima kasih atas hari ini. Ampuni kesalahanku, pulihkan kekuatanku, dan jaga aku sepanjang malam. Amin.' },
  { judul: 'Doa Syukur', isi: 'Bapa, terima kasih untuk nafas hidup, keluarga, kesehatan, dan berkat yang tak terhitung. Semoga aku jadi saluran berkat bagi orang lain. Amin.' },
  { judul: 'Doa Sebelum Makan', isi: 'Tuhan, terima kasih atas makanan yang tersedia di meja ini. Berkatilah yang menyiapkan, dan semoga makanan ini menguatkan tubuh kami. Amin.' },
  { judul: 'Doa Minta Hikmat', isi: 'Tuhan, berilah aku hikmat dalam setiap keputusan hari ini. Pimpin pikiranku agar sesuai kehendak-Mu. Amin.' },
  { judul: 'Doa Minta Perlindungan', isi: 'Bapa, lindungi aku dan keluargaku dari segala bahaya, baik yang terlihat maupun tersembunyi. Naungilah kami dengan sayap-Mu. Amin.' },
  { judul: 'Doa Untuk Orang Tua', isi: 'Tuhan, berkati kedua orang tuaku. Balaslah setiap kebaikan mereka, jaga kesehatan dan umur mereka. Amin.' },
  { judul: 'Doa Untuk Teman', isi: 'Tuhan, berkati teman-temanku. Berikan mereka kekuatan dan penghiburan di setiap musim hidup mereka. Amin.' },
  { judul: 'Doa Saat Sedih', isi: 'Tuhan, aku sedang sedih. Hibur hatiku, angkat bebanku, dan ingatkan bahwa Engkau selalu ada bersamaku. Amin.' },
  { judul: 'Doa Saat Cemas', isi: 'Bapa, aku cemas dengan banyak hal. Tenangkan pikiranku, ingatkan aku bahwa Engkau yang memegang masa depanku. Amin.' },
  { judul: 'Doa Saat Sakit', isi: 'Tuhan, aku sedang sakit. Sentuhlah tubuhku dengan kuasa-Mu, sembuhkan aku sesuai kehendak-Mu, dan kuatkan imanku. Amin.' },
  { judul: 'Doa Untuk Sesama', isi: 'Tuhan, berkati setiap orang yang kutemui hari ini. Gunakan aku sebagai alat kasih-Mu buat mereka. Amin.' },
  { judul: 'Doa Sebelum Kerja', isi: 'Bapa, berkati pekerjaanku hari ini. Berikan aku hikmat, kesabaran, dan semangat. Semoga hasil kerjaku memuliakan nama-Mu. Amin.' },
  { judul: 'Doa Untuk Negeri', isi: 'Tuhan, berkati Indonesia. Pimpin para pemimpinnya dengan hikmat, dan satukan kami dalam keberagaman. Amin.' },
  { judul: 'Doa Untuk Orang Sakit', isi: 'Tuhan, sentuhlah orang yang sedang sakit. Berikan kesembuhan, kekuatan, dan damai sejahtera. Amin.' },
  { judul: 'Doa Pengharapan', isi: 'Bapa, ketika semuanya gelap, ingatkan aku akan janji-Mu. Engkau setia dan takkan meninggalkanku. Amin.' },
  { judul: 'Doa Cinta Kasih', isi: 'Tuhan, ajarku mencintai sesama seperti Engkau mencintaiku. Hapus kebencian dan ganti dengan kasih. Amin.' },
  { judul: 'Doa Pengampunan', isi: 'Bapa, aku minta ampun atas dosa-dosaku. Bersihkan hatiku, dan ajarku memaafkan orang lain seperti Engkau memaafkanku. Amin.' },
  { judul: 'Doa Pengucapan Syukur', isi: 'Tuhan, hatiku penuh syukur. Terima kasih atas setiap berkat, besar maupun kecil. Semoga hidupku menjadi pujian bagi-Mu. Amin.' },
  { judul: 'Doa Sebelum Belajar', isi: 'Bapa, buka pikiranku untuk menerima ilmu. Berikan aku konsentrasi dan hikmat dalam belajar. Amin.' },
];

module.exports = {
  name: 'doa',
  alias: ['prayer', 'berdoa'],
  category: 'fun',
  description: 'Doa Kristen random',

  async run({ from, args, sendMessage }) {
    const filter = args?.[0]?.toLowerCase();
    let pool = DOA;
    if (filter) {
      pool = DOA.filter(d => d.judul.toLowerCase().includes(filter));
      if (!pool.length) {
        const list = [...new Set(DOA.map(d => d.judul))].sort();
        return sendMessage(from, `❌ Doa *${filter}* gak ada.\n\n*Tersedia:*\n${list.map(d => `• ${d}`).join('\n')}`);
      }
    }

    const pick = pool[Math.floor(Math.random() * pool.length)];
    await sendMessage(from, `🙏 *${pick.judul.toUpperCase()}*\n\n_"${pick.isi}"_\n\n— Amin 🙏`);
  },
};
