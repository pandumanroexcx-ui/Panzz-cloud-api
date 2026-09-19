module.exports = {
  name: 'persen',
  alias: ['percent', 'kalkulatorpersen'],
  category: 'tools',
  description: 'Kalkulator persen',

  async run({ from, args, sendMessage }) {
    if (args?.length < 2) {
      return sendMessage(from,
        '📊 *KALKULATOR PERSEN*\n\n' +
        '*Mode:*\n' +
        '• `persen <x>% dari <y>` — hitung X% dari Y\n' +
        '• `persen <x> itu berapa % dari <y>` — X dari Y berapa persen\n' +
        '• `persen naik <x> <y>` — kenaikan dari X ke Y\n' +
        '• `persen turun <x> <y>` — penurunan dari X ke Y\n\n' +
        '*Contoh:*\n' +
        '• `persen 15% dari 200000`\n' +
        '• `persen 50 itu berapa persen dari 200`\n' +
        '• `persen naik 100 150`\n' +
        '• `persen turun 200 150`'
      );
    }

    const sub = args[0].toLowerCase();

    // persen naik/turun X Y
    if (sub === 'naik' || sub === 'turun') {
      const a = parseFloat(args[1]);
      const b = parseFloat(args[2]);
      if (isNaN(a) || isNaN(b)) return sendMessage(from, '❌ Format: `persen naik 100 150`');
      const diff = b - a;
      const persen = (diff / a) * 100;
      const emoji = sub === 'naik' ? '📈' : '📉';
      return sendMessage(from,
        `${emoji} *${sub.toUpperCase()} PERSEN*\n\n` +
        `Dari: ${a}\n` +
        `Ke: ${b}\n` +
        `Selisih: ${diff >= 0 ? '+' : ''}${diff}\n\n` +
        `💯 *${persen >= 0 ? '+' : ''}${persen.toFixed(2)}%*`
      );
    }

    // persen X% dari Y
    const firstMatch = args.join(' ').match(/^(\d+(?:\.\d+)?)\s*%\s*dari\s+(\d+(?:\.\d+)?)$/i);
    if (firstMatch) {
      const x = parseFloat(firstMatch[1]);
      const y = parseFloat(firstMatch[2]);
      const hasil = (x / 100) * y;
      return sendMessage(from,
        `📊 *PERSEN*\n\n` +
        `${x}% dari ${y} = *${hasil.toLocaleString('id-ID')}*`
      );
    }

    // persen X itu berapa persen dari Y
    const secondMatch = args.join(' ').match(/^(\d+(?:\.\d+)?)\s+itu\s+berapa\s+persen\s+dari\s+(\d+(?:\.\d+)?)$/i);
    if (secondMatch) {
      const x = parseFloat(secondMatch[1]);
      const y = parseFloat(secondMatch[2]);
      const persen = (x / y) * 100;
      return sendMessage(from,
        `📊 *PERSEN*\n\n` +
        `${x} dari ${y} = *${persen.toFixed(2)}%*`
      );
    }

    // Fallback: kalau cuma 2 angka, asumsi X% dari Y
    const nums = args.filter(a => !isNaN(parseFloat(a))).map(parseFloat);
    if (nums.length >= 2) {
      const hasil = (nums[0] / 100) * nums[1];
      return sendMessage(from,
        `📊 *PERSEN*\n\n` +
        `${nums[0]}% dari ${nums[1]} = *${hasil.toLocaleString('id-ID')}*`
      );
    }

    return sendMessage(from, '❌ Format gak jelas. Ketik `persen help` ato cek contoh.');
  },
};
