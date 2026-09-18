const TZ = {
  jakarta: { offset: 7, label: 'Jakarta (WIB)' },
  wib: { offset: 7, label: 'WIB' },
  bali: { offset: 8, label: 'Bali (WITA)' },
  wita: { offset: 8, label: 'WITA' },
  jayapura: { offset: 9, label: 'Jayapura (WIT)' },
  wit: { offset: 9, label: 'WIT' },
  singapore: { offset: 8, label: 'Singapore' },
  tokyo: { offset: 9, label: 'Tokyo' },
  korea: { offset: 9, label: 'Seoul' },
  dubai: { offset: 4, label: 'Dubai' },
  mekkah: { offset: 3, label: 'Mekkah' },
  london: { offset: 0, label: 'London' },
  paris: { offset: 1, label: 'Paris' },
  newyork: { offset: -5, label: 'New York' },
  la: { offset: -8, label: 'Los Angeles' },
  sydney: { offset: 10, label: 'Sydney' },
  utc: { offset: 0, label: 'UTC' },
};

function fmt(d) {
  const h = String(d.getUTCHours()).padStart(2, '0');
  const m = String(d.getUTCMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

module.exports = {
  name: 'tz',
  alias: ['timezone', 'convertzona'],
  category: 'tools',
  description: 'Konversi waktu antar timezone',

  async run({ from, args, sendMessage }) {
    // Format: tz <jam> <dari> <ke>
    // Contoh: tz 15:00 jakarta tokyo
    const match = (args?.[0] || '').match(/^(\d{1,2}):(\d{2})$/);
    if (!match || !args[1] || !args[2]) {
      return sendMessage(from,
        '🌏 *TIMEZONE CONVERTER*\n\n' +
        'Format: `tz <jam> <dari> <ke>`\n\n' +
        '*Contoh:*\n' +
        '• `tz 15:00 jakarta tokyo`\n' +
        '• `tz 09:00 wib london`\n' +
        '• `tz 20:00 jakarta newyork`\n\n' +
        '*Kota:* jakarta, bali, jayapura, singapore, tokyo, korea, dubai, mekkah, london, paris, newyork, la, sydney, utc'
      );
    }

    const h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    if (h > 23 || m > 59) return sendMessage(from, '❌ Jam gak valid (00:00 - 23:59).');

    const dari = TZ[args[1].toLowerCase()];
    const ke = TZ[args[2].toLowerCase()];

    if (!dari) return sendMessage(from, `❌ Timezone *${args[1]}* gak ada.`);
    if (!ke) return sendMessage(from, `❌ Timezone *${args[2]}* gak ada.`);

    // Convert: bikin date di UTC
    const diffJam = ke.offset - dari.offset;
    let newH = h + diffJam;
    let hari = '';

    if (newH < 0) { newH += 24; hari = ' (kemarin)'; }
    else if (newH >= 24) { newH -= 24; hari = ' (besok)'; }

    const jam = String(newH).padStart(2, '0');
    const menit = String(m).padStart(2, '0');

    await sendMessage(from,
      `🌏 *TIMEZONE CONVERTER*\n\n` +
      `🕐 ${dari.label}: *${match[1]}:${match[2]}*\n` +
      `🔄 ⬇️\n` +
      `🕐 ${ke.label}: *${jam}:${menit}*${hari}\n\n` +
      `_Selisih: ${diffJam >= 0 ? '+' : ''}${diffJam} jam_`
    );
  },
};
