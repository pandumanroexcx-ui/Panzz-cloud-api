const { setPending, getPending, clearPending } = require('../../lib/pending-downloads');

const RIDDLES = [
  { q: 'Aku punya kepala tapi gak punya badan. Aku punya gigi tapi gak bisa makan. Siapa aku?', a: ['sisir', 'sisisr'] },
  { q: 'Semakin banyak kamu ambil, semakin besar aku jadi. Siapa aku?', a: ['lubang', 'sumur', 'lobang'] },
  { q: 'Aku selalu datang tapi gak pernah tiba. Siapa aku?', a: ['besok', 'hari esok'] },
  { q: 'Aku punya kota tapi gak punya rumah, punya gunung tapi gak punya batu. Siapa aku?', a: ['peta', 'map'] },
  { q: 'Bisa dipatahkan tanpa disentuh. Siapa aku?', a: ['janji', 'janji'] },
  { q: 'Apa yang punya banyak kunci tapi gak bisa buka pintu?', a: ['piano', 'keyboard'] },
  { q: 'Semakin aku dikurangi, semakin tinggi aku. Siapa aku?', a: ['tangga', 'anak tangga'] },
  { q: 'Aku terbang tanpa sayap, menangis tanpa mata. Siapa aku?', a: ['awan', 'mega'] },
  { q: 'Apa yang basah saat mengering?', a: ['handuk', 'sapu', 'kain'] },
  { q: 'Punya mata tapi gak bisa lihat. Siapa aku?', a: ['jarum', 'badai', 'angin'] },
  { q: 'Aku bisa kamu pecahkan tanpa menyentuh. Siapa aku?', a: ['janji', 'hati', 'sunyi'] },
  { q: 'Aku selalu di depanmu tapi gak bisa kamu lihat. Siapa aku?', a: ['masa depan', 'future'] },
  { q: 'Aku kecil, tapi bisa menutupi seluruh dunia. Siapa aku?', a: ['kegelapan', 'gelap', 'malam'] },
  { q: 'Aku punya 4 kaki di pagi, 2 kaki siang, 3 kaki sore. Siapa aku?', a: ['manusia', 'orang'] },
  { q: 'Apa yang selalu naik dan gak pernah turun?', a: ['umur', 'usia'] },
];

module.exports = {
  name: 'riddle',
  alias: ['tebaktebakan', 'teka-teki', 'teki'],
  category: 'fun',
  description: 'Main tebak-tebakan',

  async run({ from, args, sendMessage, message }) {
    const key = `riddle:${from}`;

    if (args?.[0] === 'nyerah' || args?.[0] === 'stop') {
      const pending = getPending(key);
      if (pending) {
        clearPending(key);
        await sendMessage(from, `😅 Jawabannya: *${pending.answer}*`);
      } else {
        await sendMessage(from, '❌ Kamu lagi gak main.');
      }
      return;
    }

    const pending = getPending(key);
    if (pending) {
      const jawab = (args?.join(' ') || '').toLowerCase().trim();
      const benar = pending.accept.some(a => jawab.includes(a) || a.includes(jawab));
      if (benar) {
        clearPending(key);
        await sendMessage(from, `🎉 *BENER!* Jawabannya: *${pending.answer}*\n\nMain lagi? \`riddle\``);
      } else {
        await sendMessage(from, `❌ Salah! Coba lagi.\n\n_Atau ketik \`riddle nyerah\` buat nyerah._`);
      }
      return;
    }

    const pick = RIDDLES[Math.floor(Math.random() * RIDDLES.length)];
    setPending(key, { answer: pick.a[0], accept: pick.a });
    await sendMessage(from,
      `🧩 *TEBAK-TEBAKAN*\n\n${pick.q}\n\n` +
      `Ketik jawabanmu.\n_Atau \`riddle nyerah\` buat nyerah._`
    );
  },
};
