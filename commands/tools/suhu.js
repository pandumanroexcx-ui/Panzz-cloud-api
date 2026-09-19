module.exports = {
  name: 'suhu',
  alias: ['temp', 'temperatur'],
  category: 'tools',
  description: 'Konversi suhu C/F/K/R',

  async run({ from, args, sendMessage }) {
    const match = (args?.[0] || '').match(/^(-?\d+(?:\.\d+)?)/);
    const dari = (args?.[1] || '').toUpperCase();

    if (!match) {
      return sendMessage(from,
        '🌡️ *KONVERSI SUHU*\n\n' +
        'Format: `suhu <nilai> <dari>`\n\n' +
        '*Contoh:*\n' +
        '• `suhu 100 C` — Celsius\n' +
        '• `suhu 32 F` — Fahrenheit\n' +
        '• `suhu 300 K` — Kelvin\n' +
        '• `suhu 80 R` — Reamur\n\n' +
        '*Kode:* C, F, K, R'
      );
    }

    const nilai = parseFloat(match[1]);
    let celsius;

    switch (dari) {
      case 'C': celsius = nilai; break;
      case 'F': celsius = (nilai - 32) * 5 / 9; break;
      case 'K': celsius = nilai - 273.15; break;
      case 'R': celsius = nilai * 5 / 4; break;
      default:
        return sendMessage(from, '❌ Kode suhu gak valid. Pake C, F, K, atau R.\n\nContoh: `suhu 100 C`');
    }

    const f = (celsius * 9 / 5) + 32;
    const k = celsius + 273.15;
    const r = celsius * 4 / 5;

    // Info tambahan
    let info = '';
    if (celsius <= 0) info = '🥶 Dingin banget / titik beku air';
    else if (celsius <= 15) info = '❄️ Dingin';
    else if (celsius <= 25) info = '🌤️ Sejuk';
    else if (celsius <= 32) info = '☀️ Hangat';
    else if (celsius <= 40) info = '🥵 Panas';
    else info = '🔥 Sangat panas!';

    await sendMessage(from,
      `🌡️ *KONVERSI SUHU*\n\n` +
      `Input: ${nilai}°${dari}\n\n` +
      `🌡️ Celsius: *${celsius.toFixed(2)}°C*\n` +
      `🇺🇸 Fahrenheit: *${f.toFixed(2)}°F*\n` +
      `🔬 Kelvin: *${k.toFixed(2)} K*\n` +
      `🇮🇩 Reamur: *${r.toFixed(2)}°R*\n\n` +
      `${info}`
    );
  },
};
