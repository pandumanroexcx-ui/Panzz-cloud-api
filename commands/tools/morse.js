const MORSE = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
  '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
  '8': '---..', '9': '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..',
  '!': '-.-.--', ' ': '/',
};

const REVERSE = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]));

function encode(text) {
  return text.toUpperCase().split('').map(c => MORSE[c] || '').filter(Boolean).join(' ');
}

function decode(morse) {
  return morse.trim().split(/\s+/).map(m => REVERSE[m] || '').join('');
}

module.exports = {
  name: 'morse',
  alias: ['morsecode'],
  category: 'tools',
  description: 'Encode/decode Morse code',

  async run({ from, args, sendMessage }) {
    const sub = (args?.[0] || '').toLowerCase();

    if (sub === 'encode' || sub === 'enc') {
      const text = args.slice(1).join(' ');
      if (!text) return sendMessage(from, '❌ Format: `morse encode <teks>`');
      const result = encode(text);
      return sendMessage(from, `📡 *MORSE ENCODE*\n\nInput: ${text}\n\nOutput:\n\`${result}\``);
    }

    if (sub === 'decode' || sub === 'dec') {
      const morse = args.slice(1).join(' ');
      if (!morse) return sendMessage(from, '❌ Format: `morse decode <morse>`');
      const result = decode(morse);
      return sendMessage(from, `📡 *MORSE DECODE*\n\nInput: \`${morse}\`\n\nOutput:\n${result}`);
    }

    return sendMessage(from,
      '📡 *MORSE CODE*\n\n' +
      '• `morse encode halo` → .... .- .-.. ---\n' +
      '• `morse decode .... .- .-.. ---` → HALO\n\n' +
      '*Kode Morse:*\n' +
      'A .- | B -... | C -.-. | D -.. | E .\n' +
      'F ..-. | G --. | H .... | I .. | J .---\n' +
      'K -.- | L .-.. | M -- | N -. | O ---\n' +
      'P .--. | Q --.- | R .-. | S ... | T -\n' +
      'U ..- | V ...- | W .-- | X -..- | Y -.--\n' +
      'Z --..'
    );
  },
};
