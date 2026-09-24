const BANGUN = {
  persegi: { rumus: 's × s', keliling: '4 × s', emoji: '⬛', label: 'Persegi' },
  persegipanjang: { rumus: 'p × l', keliling: '2 × (p + l)', emoji: '▬', label: 'Persegi Panjang' },
  segitiga: { rumus: '½ × a × t', keliling: 'a + b + c', emoji: '🔺', label: 'Segitiga' },
  lingkaran: { rumus: 'π × r²', keliling: '2 × π × r', emoji: '⭕', label: 'Lingkaran' },
  trapesium: { rumus: '½ × (a + b) × t', keliling: 's1 + s2 + s3 + s4', emoji: '⬜', label: 'Trapesium' },
  jajargenjang: { rumus: 'a × t', keliling: '2 × (a + b)', emoji: '▱', label: 'Jajargenjang' },
  belahketupat: { rumus: '½ × d1 × d2', keliling: '4 × s', emoji: '🔷', label: 'Belah Ketupat' },
  layanglayang: { rumus: '½ × d1 × d2', keliling: '2 × (a + b)', emoji: '🪁', label: 'Layang-layang' },
};

function formatAngka(n) {
  if (Number.isInteger(n)) return n.toLocaleString('id-ID');
  return n.toFixed(2).replace('.', ',');
}

module.exports = {
  name: 'bangun',
  alias: ['luas', 'keliling'],
  category: 'tools',
  description: 'Hitung luas & keliling bangun datar',

  async run({ from, args, sendMessage }) {
    const bangun = (args?.[0] || '').toLowerCase().replace(/[\s-]/g, '');

    if (!bangun || !BANGUN[bangun]) {
      return sendMessage(from,
        '📐 *KALKULATOR BANGUN DATAR*\n\n' +
        '*Bangun:*\n' +
        Object.entries(BANGUN).map(([k, v]) => `• ${v.emoji} \`${k}\` — ${v.label}`).join('\n') +
        '\n\n*Contoh:*\n' +
        '• `bangun persegi 5` — sisi 5\n' +
        '• `bangun persegipanjang 10 5` — p=10, l=5\n' +
        '• `bangun lingkaran 7` — jari-jari 7\n' +
        '• `bangun segitiga 6 8 10 6` — a,t,sisi-sisi'
      );
    }

    const nums = args.slice(1).map(n => parseFloat(n));
    let luas = 0, keliling = 0, detail = '';

    switch (bangun) {
      case 'persegi': {
        const s = nums[0];
        if (!s) return sendMessage(from, '❌ Format: `bangun persegi <sisi>`');
        luas = s * s;
        keliling = 4 * s;
        detail = `Sisi: ${s}`;
        break;
      }
      case 'persegipanjang': {
        const [p, l] = nums;
        if (!p || !l) return sendMessage(from, '❌ Format: `bangun persegipanjang <panjang> <lebar>`');
        luas = p * l;
        keliling = 2 * (p + l);
        detail = `Panjang: ${p}, Lebar: ${l}`;
        break;
      }
      case 'segitiga': {
        const [a, t, s1, s2, s3] = nums;
        if (!a || !t) return sendMessage(from, '❌ Format: `bangun segitiga <alas> <tinggi> [sisi-sisi]`');
        luas = 0.5 * a * t;
        keliling = (s1 && s2 && s3) ? (s1 + s2 + s3) : 0;
        detail = `Alas: ${a}, Tinggi: ${t}` + (s1 && s2 && s3 ? `, Sisi: ${s1}, ${s2}, ${s3}` : '');
        break;
      }
      case 'lingkaran': {
        const r = nums[0];
        if (!r) return sendMessage(from, '❌ Format: `bangun lingkaran <jari-jari>`');
        luas = Math.PI * r * r;
        keliling = 2 * Math.PI * r;
        detail = `Jari-jari: ${r}`;
        break;
      }
      case 'trapesium': {
        const [a, b, t] = nums;
        if (!a || !b || !t) return sendMessage(from, '❌ Format: `bangun trapesium <sisi_a> <sisi_b> <tinggi>`');
        luas = 0.5 * (a + b) * t;
        detail = `Sisi sejajar: ${a}, ${b}, Tinggi: ${t}`;
        break;
      }
      case 'jajargenjang': {
        const [a, t] = nums;
        if (!a || !t) return sendMessage(from, '❌ Format: `bangun jajargenjang <alas> <tinggi>`');
        luas = a * t;
        keliling = 2 * (a + t);
        detail = `Alas: ${a}, Tinggi: ${t}`;
        break;
      }
      case 'belahketupat': {
        const [d1, d2, s] = nums;
        if (!d1 || !d2) return sendMessage(from, '❌ Format: `bangun belahketupat <d1> <d2> [sisi]`');
        luas = 0.5 * d1 * d2;
        keliling = s ? 4 * s : 0;
        detail = `Diagonal: ${d1}, ${d2}` + (s ? `, Sisi: ${s}` : '');
        break;
      }
      case 'layanglayang': {
        const [d1, d2, a, b] = nums;
        if (!d1 || !d2) return sendMessage(from, '❌ Format: `bangun layanglayang <d1> <d2> [sisi_a] [sisi_b]`');
        luas = 0.5 * d1 * d2;
        keliling = (a && b) ? 2 * (a + b) : 0;
        detail = `Diagonal: ${d1}, ${d2}`;
        break;
      }
    }

    const b = BANGUN[bangun];
    let text = `${b.emoji} *${b.label.toUpperCase()}*\n\n`;
    text += `📐 ${detail}\n\n`;
    text += `📊 *Luas:* ${formatAngka(luas)} satuan²\n`;
    if (keliling > 0) text += `📏 *Keliling:* ${formatAngka(keliling)} satuan\n`;
    text += `\n_Rumus luas: ${b.rumus}_`;
    if (keliling > 0) text += `\n_Rumus keliling: ${b.keliling}_`;

    await sendMessage(from, text);
  },
};
