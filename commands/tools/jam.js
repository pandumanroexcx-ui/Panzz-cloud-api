const TIMEZONES = {
  'jakarta': { tz: 'Asia/Jakarta', label: 'Jakarta (WIB)', offset: 7 },
  'wib': { tz: 'Asia/Jakarta', label: 'WIB', offset: 7 },
  'bali': { tz: 'Asia/Makassar', label: 'Bali/WITA', offset: 8 },
  'wita': { tz: 'Asia/Makassar', label: 'WITA', offset: 8 },
  'jayapura': { tz: 'Asia/Jayapura', label: 'Jayapura (WIT)', offset: 9 },
  'wit': { tz: 'Asia/Jayapura', label: 'WIT', offset: 9 },
  'singapore': { tz: 'Asia/Singapore', label: 'Singapore', offset: 8 },
  'sg': { tz: 'Asia/Singapore', label: 'Singapore', offset: 8 },
  'tokyo': { tz: 'Asia/Tokyo', label: 'Tokyo', offset: 9 },
  'jepang': { tz: 'Asia/Tokyo', label: 'Tokyo (Jepang)', offset: 9 },
  'korea': { tz: 'Asia/Seoul', label: 'Seoul (Korea)', offset: 9 },
  'seoul': { tz: 'Asia/Seoul', label: 'Seoul', offset: 9 },
  'beijing': { tz: 'Asia/Shanghai', label: 'Beijing', offset: 8 },
  'china': { tz: 'Asia/Shanghai', label: 'China', offset: 8 },
  'india': { tz: 'Asia/Kolkata', label: 'India', offset: 5.5 },
  'delhi': { tz: 'Asia/Kolkata', label: 'Delhi', offset: 5.5 },
  'dubai': { tz: 'Asia/Dubai', label: 'Dubai', offset: 4 },
  'mekkah': { tz: 'Asia/Riyadh', label: 'Mekkah/Riyadh', offset: 3 },
  'madinah': { tz: 'Asia/Riyadh', label: 'Madinah', offset: 3 },
  'london': { tz: 'Europe/London', label: 'London', offset: 0 },
  'paris': { tz: 'Europe/Paris', label: 'Paris', offset: 1 },
  'berlin': { tz: 'Europe/Berlin', label: 'Berlin', offset: 1 },
  'newyork': { tz: 'America/New_York', label: 'New York', offset: -5 },
  'ny': { tz: 'America/New_York', label: 'New York', offset: -5 },
  'la': { tz: 'America/Los_Angeles', label: 'Los Angeles', offset: -8 },
  'sydney': { tz: 'Australia/Sydney', label: 'Sydney', offset: 10 },
  'australia': { tz: 'Australia/Sydney', label: 'Sydney', offset: 10 },
  'utc': { tz: 'UTC', label: 'UTC', offset: 0 },
  'gmt': { tz: 'UTC', label: 'GMT', offset: 0 },
};

function getTimeInOffset(offset) {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const local = new Date(utc + offset * 3600000);
  return local;
}

function formatTime(d) {
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function formatDate(d) {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

module.exports = {
  name: 'jam',
  alias: ['time', 'waktu'],
  category: 'tools',
  description: 'Cek jam di berbagai kota dunia',

  async run({ from, args, sendMessage }) {
    if (!args?.[0]) {
      const list = Object.keys(TIMEZONES).filter((v, i, a) => a.indexOf(v) === i && v.length <= 10).sort();
      return sendMessage(from,
        '🕐 *JAM DUNIA*\n\n' +
        'Ketik: `jam <kota>`\n\n' +
        '*Kota populer:*\n' +
        '• `jam jakarta` — WIB\n' +
        '• `jam bali` — WITA\n' +
        '• `jam jayapura` — WIT\n' +
        '• `jam singapore`\n' +
        '• `jam tokyo`\n' +
        '• `jam korea`\n' +
        '• `jam dubai`\n' +
        '• `jam mekkah`\n' +
        '• `jam london`\n' +
        '• `jam newyork`\n' +
        '• `jam la` (Los Angeles)\n' +
        '• `jam sydney`\n\n' +
        '_Atau ketik `jam` tanpa kota buat liat beberapa sekaligus._'
      );
    }

    // Kalau user ketik "jam dunia" atau "jam semua"
    const sub = args[0].toLowerCase();
    if (sub === 'dunia' || sub === 'semua' || sub === 'world' || sub === 'all') {
      const cities = ['jakarta', 'bali', 'jayapura', 'singapore', 'tokyo', 'dubai', 'mekkah', 'london', 'newyork', 'sydney'];
      const lines = [];
      for (const key of cities) {
        const t = TIMEZONES[key];
        const d = getTimeInOffset(t.offset);
        lines.push(`🌍 *${t.label}* — ${formatTime(d)}`);
      }
      return sendMessage(from, `🕐 *JAM DUNIA*\n\n${lines.join('\n')}\n\n📅 ${formatDate(new Date())}`);
    }

    const tz = TIMEZONES[sub];
    if (!tz) {
      return sendMessage(from,
        `❌ Kota *${sub}* gak ketemu.\n\n` +
        `Coba: jakarta, bali, jayapura, singapore, tokyo, korea, dubai, mekkah, london, newyork, la, sydney`
      );
    }

    const d = getTimeInOffset(tz.offset);
    const jam = d.getHours();
    let greeting = '🌙 Malam';
    if (jam >= 5 && jam < 11) greeting = '🌅 Pagi';
    else if (jam >= 11 && jam < 15) greeting = '☀️ Siang';
    else if (jam >= 15 && jam < 18) greeting = '🌇 Sore';
    else if (jam >= 18 && jam < 21) greeting = '🌆 Petang';

    return sendMessage(from,
      `🕐 *${tz.label.toUpperCase()}*\n\n` +
      `⏰ Jam: *${formatTime(d)}*\n` +
      `📅 ${formatDate(d)}\n` +
      `🌡️ ${greeting}`
    );
  },
};
