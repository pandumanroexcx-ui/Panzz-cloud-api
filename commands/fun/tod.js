const TRUTHS = [
  'Siapa orang terakhir yang kamu chat malam ini?',
  'Apa hal paling memalukan yang pernah kamu lakuin?',
  'Siapa crush pertama kamu?',
  'Apa rahasia yang belum pernah kamu kasih tau siapa pun?',
  'Pernah suka sama teman sendiri? Siapa?',
  'Apa hal yang paling kamu takutin?',
  'Kapan terakhir kamu nangis? Kenapa?',
  'Apa kebiasaan burukmu yang paling parah?',
  'Siapa orang yang paling kamu kagumi?',
  'Pernah bohong ke orang tua? Soal apa?',
  'Apa hal paling gila yang pernah kamu lakuin?',
  'Kalau bisa ngulang 1 momen, momen apa?',
  'Apa hal yang paling kamu sesali?',
  'Siapa orang yang paling pengen kamu ajak ketemu sekarang?',
  'Apa hal yang bikin kamu insecure?',
];

const DARES = [
  'Kirim pesan "Aku kangen" ke 3 orang random di kontakmu.',
  'Screenshot chat terakhirmu dan kirim ke sini.',
  'Update status WA pake lagu yang lagi kamu denger.',
  'Telepon orang yang paling kamu kangen, ngobrol 1 menit.',
  'Kirim voice note nyanyi lagu anak-anak.',
  'Chat mantan kamu, bilang "Hai apa kabar?".',
  'Screenshot foto profil WA kamu sekarang.',
  'Kirim emoji random ke 5 orang di kontakmu.',
  'Bikin status WA pake foto terjelek di galeri (10 menit).',
  'Video call orang yang paling kamu kangen.',
  'Kirim chat "Aku suka kamu" ke orang random di kontak.',
  'Nyanyi lagu favoritmu di voice note.',
  'Screenshot notifikasi HP kamu sekarang.',
  'Unfollow 5 orang random di IG.',
  'Chat grup keluarga, bilang "Aku mau nikah".',
];

module.exports = {
  name: 'tod',
  alias: ['truthordare', 'tantangan'],
  category: 'fun',
  description: 'Truth or Dare random',

  async run({ from, args, sendMessage }) {
    const mode = (args?.[0] || '').toLowerCase();
    let pick;
    let type;

    if (mode === 'truth' || mode === 't') {
      pick = TRUTHS[Math.floor(Math.random() * TRUTHS.length)];
      type = 'TRUTH';
    } else if (mode === 'dare' || mode === 'd') {
      pick = DARES[Math.floor(Math.random() * DARES.length)];
      type = 'DARE';
    } else {
      const isTruth = Math.random() < 0.5;
      pick = isTruth
        ? TRUTHS[Math.floor(Math.random() * TRUTHS.length)]
        : DARES[Math.floor(Math.random() * DARES.length)];
      type = isTruth ? 'TRUTH' : 'DARE';
    }

    await sendMessage(from, `🎯 *${type}*\n\n${pick}`);
  },
};
