function nextDate(month, day) {
  const now = new Date();
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  let y = wib.getUTCFullYear();
  let target = new Date(Date.UTC(y, month - 1, day));
  const today = new Date(Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth(), wib.getUTCDate()));
  if (target < today) target = new Date(Date.UTC(y + 1, month - 1, day));
  return Math.round((target - today) / 86400000);
}

const HARI_BESAR = [
  { nama: 'Tahun Baru', emoji: '🎊', fn: () => nextDate(1, 1) },
  { nama: 'Valentine', emoji: '💕', fn: () => nextDate(2, 14) },
  { nama: 'Nyepi (Bali)', emoji: '🕉️', fn: () => nextDate(3, 11) },
  { nama: 'Hari Kartini', emoji: '👩', fn: () => nextDate(4, 21) },
  { nama: 'Hari Buruh', emoji: '👷', fn: () => nextDate(5, 1) },
  { nama: 'Hari Lahir Pancasila', emoji: '🇮🇩', fn: () => nextDate(6, 1) },
  { nama: 'Hari Anak', emoji: '🧒', fn: () => nextDate(7, 23) },
  { nama: 'HUT RI (Kemerdekaan)', emoji: '🇮🇩', fn: () => nextDate(8, 17) },
  { nama: 'Hari Guru', emoji: '🎓', fn: () => nextDate(11, 25) },
  { nama: 'Natal', emoji: '🎄', fn: () => nextDate(12, 25) },
  { nama: 'Malam Tahun Baru', emoji: '🎆', fn: () => nextDate(12, 31) },
];

module.exports = {
  name: 'haribesar',
  alias: ['libur', 'holiday'],
  category: 'tools',
  description: 'Countdown ke hari besar',

  async run({ from, sendMessage }) {
    const list = HARI_BESAR.map(h => ({ ...h, sisa: h.fn() }))
                          .sort((a, b) => a.sisa - b.sisa);

    const lines = list.map(h => {
      let info = `${h.sisa} hari`;
      if (h.sisa === 0) info = '🎉 HARI INI!';
      else if (h.sisa === 1) info = '🎁 BESOK!';
      else if (h.sisa <= 7) info = `⚠️ ${h.sisa} hari`;
      return `${h.emoji} *${h.nama}* — ${info}`;
    });

    await sendMessage(from, `🗓️ *COUNTDOWN HARI BESAR*\n\n${lines.join('\n')}`);
  },
};
