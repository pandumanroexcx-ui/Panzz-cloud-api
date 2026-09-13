const PATTERNS = [
  { platform: 'tiktok', regex: /(https?:\/\/)?(www\.)?(vt\.|vm\.)?tiktok\.com\/\S+/i },
  { platform: 'instagram', regex: /(https?:\/\/)?(www\.)?instagram\.com\/\S+/i },
  { platform: 'youtube', regex: /(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/\S+/i },
  { platform: 'facebook', regex: /(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch)\/\S+/i },
  { platform: 'douyin', regex: /(https?:\/\/)?(www\.)?douyin\.com\/\S+/i },
  { platform: 'capcut', regex: /(https?:\/\/)?(www\.)?capcut\.(co|com)\/\S+/i },
];

function detectLink(text) {
  for (const { platform, regex } of PATTERNS) {
    const match = text.match(regex);
    if (match) {
      return { platform, url: match[0] };
    }
  }
  return null;
}

module.exports = { detectLink };
