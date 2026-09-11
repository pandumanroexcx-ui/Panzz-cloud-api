const sharp = require('sharp');

function buildBannerSVG(title, subtitle) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="300">
    <rect width="800" height="300" fill="#0f172a"/>
    <rect x="0" y="0" width="800" height="8" fill="#22d3ee"/>
    <text x="400" y="150" font-size="56" fill="white" text-anchor="middle" font-family="sans-serif" font-weight="bold">${title}</text>
    <text x="400" y="200" font-size="24" fill="#94a3b8" text-anchor="middle" font-family="sans-serif">${subtitle}</text>
  </svg>`;
}

async function generateBanner(title, subtitle) {
  return sharp(Buffer.from(buildBannerSVG(title, subtitle))).png().toBuffer();
}

module.exports = { generateBanner };
