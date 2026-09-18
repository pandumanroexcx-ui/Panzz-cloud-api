function caesarShift(text, shift) {
  shift = ((shift % 26) + 26) % 26;
  return text.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + shift) % 26) + base);
  });
}

module.exports = {
  name: 'caesar',
  alias: ['cipher', 'sandicesar'],
  category: 'tools',
  description: 'Caesar cipher (geser huruf)',

  async run({ from, args, sendMessage }) {
    const sub = (args?.[0] || '').toLowerCase();

    if (sub === 'encrypt' || sub === 'enc' || sub === 'encode') {
      const shift = parseInt(args[1], 10);
      const text = args.slice(2).join(' ');
      if (isNaN(shift) || !text) {
        return sendMessage(from, '❌ Format: `caesar encrypt <shift> <teks>`\nContoh: `caesar encrypt 3 Halo Dunia`');
      }
      const result = caesarShift(text, shift);
      return sendMessage(from, `🔐 *CAESAR ENCRYPT (shift ${shift})*\n\nInput: ${text}\n\n\`${result}\``);
    }

    if (sub === 'decrypt' || sub === 'dec' || sub === 'decode') {
      const shift = parseInt(args[1], 10);
      const text = args.slice(2).join(' ');
      if (isNaN(shift) || !text) {
        return sendMessage(from, '❌ Format: `caesar decrypt <shift> <teks>`');
      }
      const result = caesarShift(text, -shift);
      return sendMessage(from, `🔓 *CAESAR DECRYPT (shift ${shift})*\n\nInput: ${text}\n\n\`${result}\``);
    }

    if (sub === 'bruteforce' || sub === 'brute' || sub === 'bf') {
      const text = args.slice(1).join(' ');
      if (!text) return sendMessage(from, '❌ Format: `caesar bruteforce <teks>`\n\n_Nampilin semua kemungkinan shift._');
      let output = `🔍 *BRUTEFORCE CAESAR*\n\n`;
      for (let i = 1; i <= 25; i++) {
        output += `Shift ${i.toString().padStart(2)}: \`${caesarShift(text, -i)}\`\n`;
      }
      return sendMessage(from, output);
    }

    return sendMessage(from,
      '🔐 *CAESAR CIPHER*\n\n' +
      'Caesar cipher = geser setiap huruf berdasarkan shift.\n\n' +
      '*Command:*\n' +
      '• `caesar encrypt 3 Halo` → Kdor\n' +
      '• `caesar decrypt 3 Kdor` → Halo\n' +
      '• `caesar bruteforce Kdor` → semua kemungkinan\n\n' +
      '_Buat decrypt kalau lupa shift._'
    );
  },
};
