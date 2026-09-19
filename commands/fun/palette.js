const { createCanvas } = require('@napi-rs/canvas');
const { uploadImage } = require('../../lib/whatsapp-media');
const { sendImage } = require('../../lib/send-message');

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = x => Math.round(255 * x).toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`.toUpperCase();
}

function generatePalette() {
  const baseHue = Math.floor(Math.random() * 360);
  const colors = [];
  for (let i = 0; i < 5; i++) {
    const h = (baseHue + i * 25) % 360;
    const s = 50 + Math.floor(Math.random() * 40);
    const l = 30 + i * 12;
    colors.push(hslToHex(h, s, l));
  }
  return colors;
}

async function generatePaletteImage(colors) {
  const canvas = createCanvas(600, 200);
  const ctx = canvas.getContext('2d');

  const w = 600 / colors.length;
  colors.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(i * w, 0, w, 200);
  });

  // Text hex di tiap warna
  colors.forEach((c, i) => {
    // Hitung brightness
    const r = parseInt(c.slice(1, 3), 16);
    const g = parseInt(c.slice(3, 5), 16);
    const b = parseInt(c.slice(5, 7), 16);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    ctx.fillStyle = lum > 0.5 ? '#000' : '#FFF';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(c, i * w + w / 2, 110);
  });

  return canvas.toBuffer('image/png');
}

module.exports = {
  name: 'palette',
  alias: ['warnapalet', 'colorpalette'],
  category: 'fun',
  description: 'Generate palet warna harmonis',

  async run({ from, sendMessage }) {
    await sendMessage(from, '🎨 Lagi bikin palet...');

    const colors = generatePalette();
    const text = `🎨 *PALET WARNA*\n\n` +
      colors.map((c, i) => `${i + 1}. \`${c}\``).join('\n') +
      `\n\n_Cocok buat design, brand, atau wallpaper_`;

    try {
      const imgBuffer = await generatePaletteImage(colors);
      const mediaId = await uploadImage(imgBuffer, 'palette.png');
      await sendImage(from, mediaId, text);
    } catch (e) {
      console.error('[PALETTE]', e.message);
      await sendMessage(from, text);
    }
  },
};
