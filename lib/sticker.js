const sharp = require('sharp');

async function imageToSticker(buffer) {
  return sharp(buffer)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp()
    .toBuffer();
}

module.exports = { imageToSticker };
