function generatePassword(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
  let pass = '';
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

module.exports = {
  name: 'pass',
  alias: ['password', 'pwgen'],
  category: 'tools',
  description: 'Generate random password',

  async run({ from, args, sendMessage }) {
    let length = parseInt(args?.[0], 10);
    if (isNaN(length) || length < 6) length = 16;
    if (length > 64) length = 64;

    const password = generatePassword(length);
    await sendMessage(from,
      `🔐 *PASSWORD GENERATOR*\n\n` +
      `\`${password}\`\n\n` +
      `📏 Panjang: ${length} karakter\n` +
      `🔀 Huruf, angka, simbol`
    );
  },
};
