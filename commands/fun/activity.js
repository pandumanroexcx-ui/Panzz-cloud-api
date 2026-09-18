const ACTIVITIES = {
  bosan: [
    'Coba resep baru di dapur', 'Nonton film yang udah lama di watchlist',
    'Baca buku 1 bab', 'Jalan santai keliling komplek', 'Beresin kamar/meja',
    'Telepon teman lama', 'Main game mobile', 'Belajar skill baru di YouTube',
    'Bikin journal hari ini', 'Dengerin podcast random',
  ],
  sendiri: [
    'Meditasi 10 menit', 'Journaling', 'Self-care (masker, skincare)',
    'Bikin playlist lagu favorit', 'Duduk di cafe, orang watching',
    'Belajar bahasa baru', 'Bikin bucket list', 'Beresin galeri HP',
  ],
  produktif: [
    'Bikin to-do list besok', 'Review goal bulan ini',
    'Belajar 1 chapter skill baru', 'Baca 1 artikel bermanfaat',
    'Beresin inbox email', 'Update CV/portofolio', 'Belajar 30 menit coding',
  ],
  santai: [
    'Nonton sunset/sunrise', 'Tidur siang 20 menit',
    'Main sama hewan peliharaan', 'Ngopi sambil baca buku',
    'Dengerin musik lo-fi', 'Mandi air hangat + aromaterapi',
  ],
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = {
  name: 'activity',
  alias: ['aktivitas', 'ngapain', 'bosen'],
  category: 'fun',
  description: 'Ide aktivitas random',

  async run({ from, args, sendMessage }) {
    const mood = (args?.[0] || '').toLowerCase();
    let pool, kategori;

    if (ACTIVITIES[mood]) {
      pool = ACTIVITIES[mood];
      kategori = mood;
    } else {
      // Random dari semua kategori
      const keys = Object.keys(ACTIVITIES);
      kategori = keys[Math.floor(Math.random() * keys.length)];
      pool = ACTIVITIES[kategori];
    }

    const pick = pickRandom(pool);
    const emoji = { bosan: '😴', sendiri: '🧘', produktif: '💼', santai: '🍃' }[kategori];

    await sendMessage(from, `${emoji} *IDE AKTIVITAS*\n\nKategori: ${kategori.toUpperCase()}\n\n💡 *${pick}*\n\n_Ketik \`activity\` lagi buat yang baru._`);
  },
};
