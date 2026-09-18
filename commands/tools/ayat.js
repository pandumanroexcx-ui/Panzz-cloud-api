// Ayat Alkitab & kata mutiara Kristen
const AYAT = [
  { kitab: 'Yohanes 3:16', text: 'Karena begitu besar kasih Allah akan dunia ini, sehingga Ia telah mengaruniakan Anak-Nya yang tunggal, supaya setiap orang yang percaya kepada-Nya tidak binasa, melainkan beroleh hidup yang kekal.' },
  { kitab: 'Mazmur 23:1', text: 'TUHAN adalah gembalaku, takkan kekurangan aku.' },
  { kitab: 'Filipi 4:13', text: 'Segala perkara dapat kutanggung di dalam Dia yang memberi kekuatan kepadaku.' },
  { kitab: 'Roma 8:28', text: 'Kita tahu sekarang, bahwa Allah turut bekerja dalam segala sesuatu untuk mendatangkan kebaikan bagi mereka yang mengasihi Dia.' },
  { kitab: 'Yeremia 29:11', text: 'Sebab Aku ini mengetahui rancangan-rancangan apa yang ada pada-Ku mengenai kamu, yaitu rancangan damai sejahtera dan bukan rancangan kecelakaan, untuk memberikan kepadamu hari depan yang penuh harapan.' },
  { kitab: 'Matius 11:28', text: 'Marilah kepada-Ku, semua yang letih lesu dan berbeban berat, Aku akan memberi kelegaan kepadamu.' },
  { kitab: 'Amsal 3:5', text: 'Percayalah kepada TUHAN dengan segenap hatimu, dan janganlah bersandar kepada pengertianmu sendiri.' },
  { kitab: 'Yesaya 41:10', text: 'Janganlah takut, sebab Aku menyertai engkau, janganlah bimbang, sebab Aku ini Allahmu; Aku akan meneguhkan, bahkan akan menolong engkau.' },
  { kitab: '1 Korintus 13:4', text: 'Kasih itu sabar; kasih itu murah hati; ia tidak cemburu. Ia tidak memegahkan diri dan tidak sombong.' },
  { kitab: 'Mazmur 46:2', text: 'Allah itu bagi kita tempat perlindungan dan kekuatan, sebagai penolong dalam kesesakan sangat terbukti.' },
  { kitab: 'Yosua 1:9', text: 'Kuatkan dan teguhkanlah hatimu, janganlah takut dan jangan gemetar, sebab TUHAN, Allahmu, menyertai engkau ke mana pun engkau pergi.' },
  { kitab: 'Matius 6:33', text: 'Tetapi carilah dahulu Kerajaan Allah dan kebenarannya, maka semuanya itu akan ditambahkan kepadamu.' },
  { kitab: 'Galatia 5:22', text: 'Tetapi buah Roh ialah: kasih, sukacita, damai sejahtera, kesabaran, kemurahan, kebaikan, kesetiaan.' },
  { kitab: '2 Timotius 1:7', text: 'Sebab Allah memberikan kepada kita bukan roh ketakutan, melainkan roh yang membangkitkan kekuatan, kasih dan ketertiban.' },
  { kitab: 'Mazmur 37:4', text: 'Bergembiralah karena TUHAN; maka Ia akan memberikan kepadamu apa yang diinginkan hatimu.' },
  { kitab: 'Efesus 4:32', text: 'Tetapi hendaklah kamu ramah seorang terhadap yang lain, penuh kasih mesra dan saling mengampuni, sebagaimana Allah di dalam Kristus telah mengampuni kamu.' },
  { kitab: 'Yakobus 1:2-3', text: 'Anggaplah sebagai suatu kebahagiaan, apabila kamu jatuh ke dalam berbagai-bagai pencobaan, sebab kamu tahu, bahwa ujian terhadap imanmu itu menghasilkan ketekunan.' },
  { kitab: 'Roma 12:2', text: 'Janganlah kamu menjadi serupa dengan dunia ini, tetapi berubahlah oleh pembaharuan budimu.' },
  { kitab: 'Mazmur 119:105', text: 'Firman-Mu itu pelita bagi kakiku dan terang bagi jalanku.' },
  { kitab: '1 Yohanes 4:19', text: 'Kita mengasihi, karena Allah lebih dahulu mengasihi kita.' },
];

module.exports = {
  name: 'ayat',
  alias: ['alkitab', 'firman', 'verse'],
  category: 'tools',
  description: 'Ayat Alkitab random harian',

  async run({ from, args, sendMessage }) {
    const filter = args?.[0]?.toLowerCase();
    let pool = AYAT;
    if (filter) {
      pool = AYAT.filter(a => a.kitab.toLowerCase().includes(filter));
      if (!pool.length) {
        const kitabList = [...new Set(AYAT.map(a => a.kitab.split(' ')[0]))].sort();
        return sendMessage(from, `❌ Kitab *${filter}* gak ada.\n\n*Tersedia:* ${kitabList.join(', ')}`);
      }
    }

    const pick = pool[Math.floor(Math.random() * pool.length)];
    await sendMessage(from, `✝️ *${pick.kitab}*\n\n_"${pick.text}"_`);
  },
};
