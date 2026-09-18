function checkStrength(pwd) {
  let score = 0;
  const checks = {
    length8: pwd.length >= 8,
    length12: pwd.length >= 12,
    lower: /[a-z]/.test(pwd),
    upper: /[A-Z]/.test(pwd),
    digit: /[0-9]/.test(pwd),
    symbol: /[^A-Za-z0-9]/.test(pwd),
    noCommon: !/^(password|123456|qwerty|admin|user)/i.test(pwd),
    noRepeat: !/(.)\1{2,}/.test(pwd),
  };

  for (const v of Object.values(checks)) if (v) score++;

  let label, emoji;
  if (score <= 2) { label = 'SANGAT LEMAH'; emoji = '🚨'; }
  else if (score <= 4) { label = 'LEMAH'; emoji = '⚠️'; }
  else if (score <= 6) { label = 'SEDANG'; emoji = '🔶'; }
  else if (score <= 7) { label = 'KUAT'; emoji = '✅'; }
  else { label = 'SANGAT KUAT'; emoji = '💪'; }

  return { score, max: 8, label, emoji, checks };
}

module.exports = {
  name: 'pwstrength',
  alias: ['cekpass', 'passcheck'],
  category: 'tools',
  description: 'Cek kekuatan password',

  async run({ from, args, sendMessage }) {
    const pwd = args.join(' ');
    if (!pwd) return sendMessage(from, '🔐 Format: `pwstrength <password>`\n\n_⚠️ Jangan kirim password asli kamu yang penting!_');
    if (pwd.length > 100) return sendMessage(from, '❌ Max 100 karakter.');

    const r = checkStrength(pwd);
    const bar = '█'.repeat(r.score) + '░'.repeat(r.max - r.score);
    const checks = [
      `${r.checks.length8 ? '✅' : '❌'} Minimal 8 karakter`,
      `${r.checks.length12 ? '✅' : '❌'} Minimal 12 karakter`,
      `${r.checks.lower ? '✅' : '❌'} Huruf kecil (a-z)`,
      `${r.checks.upper ? '✅' : '❌'} Huruf besar (A-Z)`,
      `${r.checks.digit ? '✅' : '❌'} Angka (0-9)`,
      `${r.checks.symbol ? '✅' : '❌'} Simbol (!@#$)`,
      `${r.checks.noCommon ? '✅' : '❌'} Bukan password umum`,
      `${r.checks.noRepeat ? '✅' : '❌'} Gak ada karakter berulang`,
    ];

    await sendMessage(from,
      `🔐 *PASSWORD STRENGTH*\n\n` +
      `${bar} ${r.score}/${r.max}\n\n` +
      `${r.emoji} *${r.label}*\n\n` +
      `*Checklist:*\n${checks.join('\n')}\n\n` +
      `_⚠️ Jangan kirim password asli!_`
    );
  },
};
