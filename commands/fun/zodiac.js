const ZODIAK = {
  aries: { emoji: '♈', tanggal: '21 Mar - 19 Apr', elemen: 'Api', planet: 'Mars', sifat: 'Berani, energik, kompetitif, impulsif', cocok: 'Leo, Sagittarius, Gemini' },
  taurus: { emoji: '♉', tanggal: '20 Apr - 20 Mei', elemen: 'Bumi', planet: 'Venus', sifat: 'Sabar, setia, materialistis, keras kepala', cocok: 'Virgo, Capricorn, Cancer' },
  gemini: { emoji: '♊', tanggal: '21 Mei - 20 Jun', elemen: 'Udara', planet: 'Merkurius', sifat: 'Cerdas, komunikatif, mudah bosan', cocok: 'Libra, Aquarius, Aries' },
  cancer: { emoji: '♋', tanggal: '21 Jun - 22 Jul', elemen: 'Air', planet: 'Bulan', sifat: 'Peka, setia, protektif, moody', cocok: 'Scorpio, Pisces, Taurus' },
  leo: { emoji: '♌', tanggal: '23 Jul - 22 Agu', elemen: 'Api', planet: 'Matahari', sifat: 'Percaya diri, murah hati, dramatis', cocok: 'Aries, Sagittarius, Gemini' },
  virgo: { emoji: '♍', tanggal: '23 Agu - 22 Sep', elemen: 'Bumi', planet: 'Merkurius', sifat: 'Perfeksionis, analitis, praktis', cocok: 'Taurus, Capricorn, Cancer' },
  libra: { emoji: '♎', tanggal: '23 Sep - 22 Okt', elemen: 'Udara', planet: 'Venus', sifat: 'Seimbang, diplomatis, cinta damai', cocok: 'Gemini, Aquarius, Leo' },
  scorpio: { emoji: '♏', tanggal: '23 Okt - 21 Nov', elemen: 'Air', planet: 'Pluto', sifat: 'Intens, misterius, setia, posesif', cocok: 'Cancer, Pisces, Virgo' },
  sagittarius: { emoji: '♐', tanggal: '22 Nov - 21 Des', elemen: 'Api', planet: 'Jupiter', sifat: 'Petualang, optimis, jujur, blak-blakan', cocok: 'Aries, Leo, Aquarius' },
  capricorn: { emoji: '♑', tanggal: '22 Des - 19 Jan', elemen: 'Bumi', planet: 'Saturnus', sifat: 'Ambisius, disiplin, konservatif', cocok: 'Taurus, Virgo, Pisces' },
  aquarius: { emoji: '♒', tanggal: '20 Jan - 18 Feb', elemen: 'Udara', planet: 'Uranus', sifat: 'Inovatif, independen, eksentrik', cocok: 'Gemini, Libra, Sagittarius' },
  pisces: { emoji: '♓', tanggal: '19 Feb - 20 Mar', elemen: 'Air', planet: 'Neptunus', sifat: 'Imajinatif, empatik, sensitif', cocok: 'Cancer, Scorpio, Capricorn' },
};

module.exports = {
  name: 'zodiac',
  alias: ['zodiak', 'zodiacinfo'],
  category: 'fun',
  description: 'Info zodiak lengkap',

  async run({ from, args, sendMessage }) {
    const input = (args?.[0] || '').toLowerCase();
    if (input && ZODIAK[input]) {
      const z = ZODIAK[input];
      return sendMessage(from,
        `${z.emoji} *ZODIAK ${input.toUpperCase()}*\n\n` +
        `📅 Tanggal: ${z.tanggal}\n` +
        `🔥 Elemen: ${z.elemen}\n` +
        `🪐 Planet: ${z.planet}\n\n` +
        `💫 *Sifat:* ${z.sifat}\n` +
        `❤️ *Cocok dengan:* ${z.cocok}`
      );
    }

    const list = Object.entries(ZODIAK).map(([k, v]) => `${v.emoji} *${k}* — ${v.tanggal}`).join('\n');
    return sendMessage(from,
      `♈♉♊ *INFO ZODIAK*\n\n${list}\n\n` +
      `_Ketik: \`zodiac aries\` buat detail._`
    );
  },
};
