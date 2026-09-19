// HIAS TEXT — fancy font + warna HEX (buat bio MLBB, IG, TikTok)

const STYLE_MAPS = {
  bold: { from: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', to: '𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗' },
  italic: { from: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', to: '𝐴𝐵𝐶𝐷𝐸𝐹𝐺𝐻𝐼𝐽𝐾𝐿𝑀𝑁𝑂𝑃𝑄𝑅𝑆𝑇𝑈𝑉𝑊𝑋𝑌𝑍𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧' },
  bolditalic: { from: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', to: '𝑨𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑱𝑲𝑳𝑴𝑵𝑶𝑷𝑸𝑹𝑺𝑻𝑼𝑽𝑾𝑿𝒀𝒁𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛' },
  script: { from: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', to: '𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏' },
  fraktur: { from: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', to: '𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷' },
  doublestruck: { from: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', to: '𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡' },
  mono: { from: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', to: '𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿' },
  bubble: { from: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', to: 'ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ' },
  smallcaps: { from: 'abcdefghijklmnopqrstuvwxyz', to: 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀꜱᴛᴜᴠᴡxʏᴢ' },
};

// Kode HEX buat MLBB/IG bio
const COLORS_HEX = {
  merah: 'FF0000', red: 'FF0000',
  orange: 'FF8C00', oranye: 'FF8C00',
  kuning: 'FFFF00', yellow: 'FFFF00',
  hijau: '00FF00', green: '00FF00',
  hijaumuda: '90EE90', hijaugelap: '008000',
  biru: '0000FF', blue: '0000FF',
  birumuda: '87CEEB', birugelap: '00008B',
  ungu: '800080', purple: '800080', violet: '8A2BE2',
  pink: 'FF69B4',
  hitam: '000000', black: '000000',
  putih: 'FFFFFF', white: 'FFFFFF',
  coklat: '8B4513', brown: '8B4513',
  gold: 'FFD700', emas: 'FFD700',
  silver: 'C0C0C0', perak: 'C0C0C0',
  cyan: '00FFFF', aqua: '00FFFF',
  maroon: '800000', merahmaroon: '800000',
  navy: '000080', birunavy: '000080',
  olive: '808000', zaitun: '808000',
  lime: '00FF00',
  tosca: '40E0D0', turquoise: '40E0D0',
  lavender: 'E6E6FA',
  salmon: 'FA8072',
  coral: 'FF7F50',
  tomat: 'FF6347',
  abu: '808080', gray: '808080', grey: '808080',
  krem: 'FFFDD0', cream: 'FFFDD0',
  beige: 'F5F5DC',
};

const STYLE_KEYWORDS = {
  tebal: 'bold', bold: 'bold',
  miring: 'italic', italic: 'italic',
  tebalmiring: 'bolditalic', bi: 'bolditalic',
  script: 'script', cursive: 'script',
  fraktur: 'fraktur', gothic: 'fraktur',
  double: 'doublestruck',
  mono: 'mono',
  bubble: 'bubble', bulat: 'bubble',
  smallcaps: 'smallcaps',
  normal: 'normal', biasa: 'normal',
};

function applyStyle(text, style) {
  if (!style || style === 'normal') return text;
  const map = STYLE_MAPS[style];
  if (!map) return text;
  const fromArr = [...map.from], toArr = [...map.to];
  return [...text].map(c => {
    const i = fromArr.indexOf(c);
    return i >= 0 ? toArr[i] : c;
  }).join('');
}

function parseInput(input) {
  const tokens = input.split(/\s+/).filter(Boolean);
  const words = [];
  let currentStyle = 'normal';

  for (const t of tokens) {
    const lower = t.toLowerCase();
    if (STYLE_KEYWORDS[lower]) {
      currentStyle = STYLE_KEYWORDS[lower];
      continue;
    }
    if (COLORS_HEX[lower]) {
      if (words.length > 0) words[words.length - 1].color = COLORS_HEX[lower];
      continue;
    }
    words.push({ text: t, style: currentStyle, color: null });
  }
  return words;
}

module.exports = {
  name: 'hias',
  alias: ['warna', 'bio', 'mlbb', 'fancy'],
  category: 'tools',
  description: 'Hias text dengan fancy font + kode warna HEX (bio MLBB/IG)',

  async run({ from, message, sendMessage }) {
    const raw = (message?.text?.body || '')
      .replace(/^\.?(hias|warna|bio|mlbb|fancy)\s+/i, '')
      .trim();

    if (!raw || raw === 'help' || raw === 'list') {
      return sendMessage(from,
        '🎨 *HIAS TEXT (Bio MLBB/IG)*\n\n' +
        '*Format:* `hias <style?> <kata> <warna> <kata> <warna> ...`\n\n' +
        '*Contoh:*\n' +
        '`hias tebal panzz hijau botz ungu`\n\n' +
        '*Output:*\n' +
        '`[00FF00]𝐏𝐚𝐧𝐳𝐳 [800080]𝐁𝐨𝐭𝐳`\n\n' +
        '🎨 *Warna:* merah, orange, kuning, hijau, biru, ungu, pink, hitam, putih, coklat, gold, silver, cyan, navy, maroon, olive, tosca, lavender, abu, krem, dll\n\n' +
        '✨ *Style:* tebal, miring, tebalmiring, script, fraktur, double, mono, bubble, smallcaps, normal\n\n' +
        '💡 _Style di depan = berlaku buat semua kata. Warna setelah kata = kasih warna kata itu._'
      );
    }

    try {
      const words = parseInput(raw);
      if (!words.length) return sendMessage(from, '❌ Gak ada kata yang valid. Contoh: `hias tebal panzz hijau botz ungu`');

      // Generate 3 format
      const fmtA = words.map(w => {
        const fancy = applyStyle(w.text, w.style);
        return w.color ? `[${w.color}]${fancy}` : fancy;
      }).join(' ');

      const fmtB = words.map(w => {
        const fancy = applyStyle(w.text, w.style);
        return w.color ? `${fancy}[${w.color}]` : fancy;
      }).join(' ');

      const fmtC = words.map(w => {
        const fancy = applyStyle(w.text, w.style);
        return w.color ? `[${w.color}]${fancy}[-]` : fancy;
      }).join(' ');

      await sendMessage(from,
        `🎨 *HASIL HIAS*\n\n` +
        `*📌 Format A (HEX sebelum):*\n\`${fmtA}\`\n\n` +
        `*📌 Format B (HEX sesudah):*\n\`${fmtB}\`\n\n` +
        `*📌 Format C (HEX + [-], paling umum MLBB):*\n\`${fmtC}\`\n\n` +
        `_Copy salah satu ke bio, test mana yang works!_ ✅`
      );
    } catch (e) {
      console.error('[HIAS]', e.message);
      await sendMessage(from, `⚠️ Gagal: ${e.message}`);
    }
  },
};
