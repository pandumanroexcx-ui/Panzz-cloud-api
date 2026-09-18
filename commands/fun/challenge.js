const CHALLENGES = [
  'Push up 20x sekarang! 💪',
  'Kirim voice note nyanyi lagu anak-anak ke grup keluarga. 😂',
  'Screenshot chat terakhir, kirim ke sini. 📸',
  'Video call orang tua, bilang "Aku sayang kalian". ❤️',
  'Chat 3 teman lama, tanya kabar. 📱',
  'Post story selfie tanpa filter sekarang. 🤳',
  'Puasa sosmed 3 jam dari sekarang. 📵',
  'Minum air putih 2 gelas sekarang. 💧',
  'Jalan santai 15 menit. 🚶',
  'Baca 5 halaman buku. 📖',
  'Tulis 3 hal yang kamu syukuri hari ini. ✍️',
  'Beresin meja kerja/kamar 10 menit. 🧹',
  'Kirim pesan "Aku kangen" ke 3 orang random di kontak. 💌',
  'Nyanyi lagu favoritmu sekarang (voice note). 🎤',
  'Foto langit dari jendela, kirim ke sini. 🌤️',
  'Push up 10x sambil bilang "Aku keren". 😎',
  'Call teman terdekat, ngobrol 5 menit. ☎️',
  'Bikin 1 resolusi baru hari ini. 📝',
  'Tersenyum ke cermin 30 detik. 😄',
  'Makan 1 buah sekarang. 🍎',
  'Matikan HP 30 menit, lakuin hal produktif. 🔇',
  'DM 1 orang yang menginspirasi kamu. 💬',
];

module.exports = {
  name: 'challenge',
  alias: ['tantangan', 'chal'],
  category: 'fun',
  description: 'Tantangan random buat hari ini',

  async run({ from, sendMessage }) {
    const pick = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
    await sendMessage(from, `🎯 *TANTANGAN HARI INI*\n\n${pick}\n\n_Accept? Ketik \`challenge\` lagi buat yang baru!_`);
  },
};
