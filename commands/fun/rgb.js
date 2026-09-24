const NAMA_WARNA = [
  { min: [255, 0, 0], nama: 'Merah' },
  { min: [0, 128, 0], nama: 'Hijau' },
  { min: [0, 0, 255], nama: 'Biru' },
  { min: [255, 255, 0], nama: 'Kuning' },
  { min: [255, 165, 0], nama: 'Orange' },
  { min: [128, 0, 128], nama: 'Ungu' },
  { min: [255, 192, 203], nama: 'Pink' },
  { min: [0, 0, 0], nama: 'Hitam' },
  { min: [255, 255, 255], nama: 'Putih' },
  { min: [128, 128, 128], nama: 'Abu-abu' },
  { min: [165, 42, 42], nama: 'Coklat' },
  { min: [0, 255, 255], nama: 'Cyan' },
  { min: [255, 0, 255], nama: 'Magenta' },
];

function cariNamaWarna(r, g, b) {
  let best = null, bestDist = Infinity;
  for (const n of NAMA_WARNA) {
    const dist = Math.sqrt((r - n.min[0]) ** 2 + (g - n.min[1]) ** 2 + (b - n.min[2]) ** 2);
    if (dist < bestDist) { bestDist = dist; best = n.nama; }
  }
  return bestDist < 100 ? best : 'Campuran unik';
}

module.exports = {
  name: 'rgb',
  alias: ['randomrgb', 'warnargb'],
  category: 'fun',
  description: 'Random warna lengkap (HEX, RGB, HSL)',

  async run({ from, sendMessage }) {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const hex = '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('').toUpperCase();

    // HSL
    const rn = r / 255, gn = g / 255, bn = b / 255;
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)); break;
        case gn: h = ((bn - rn) / d + 2); break;
        case bn: h = ((rn - gn) / d + 4); break;
      }
      h /= 6;
    }
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    const nama = cariNamaWarna(r, g, b);

    // Preview visual (emoji kotak sesuai brightness)
    const bright = (r * 0.299 + g * 0.587 + b * 0.114);
    const emoji = bright > 200 ? '⬜' : bright > 100 ? '🟨' : '⬛';

    await sendMessage(from,
      `🎨 *WARNA RANDOM*\n\n` +
      `${emoji} *Nama:* ${nama}\n\n` +
      `🔹 HEX: \`${hex}\`\n` +
      `🔸 RGB: \`rgb(${r}, ${g}, ${b})\`\n` +
      `🔹 HSL: \`hsl(${h}, ${s}%, ${l}%)\`\n\n` +
      `📊 Brightness: ${Math.round(bright)}/255\n\n` +
      `_Coba \`warna ${hex}\` buat preview visual!_`
    );
  },
};
