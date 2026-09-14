const { sendMessage } = require('./send-message');
const { isActive } = require('./confess-store');
const db = require('./db');

const stmtLog = db.prepare(
  'INSERT INTO confess_log (sender, target, target_name, initials, message, created_at) VALUES (?, ?, ?, ?, ?, ?)'
);

function normalizeNumber(input) {
  let num = String(input).replace(/\D/g, '');
  if (num.startsWith('0')) num = '62' + num.slice(1);
  if (num.startsWith('8')) num = '62' + num;
  return num;
}

function generateInitials(name) {
  if (!name) return '?';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return words.map(w => w.charAt(0).toUpperCase()).join('');
}

async function sendConfess(senderNumber, targetInput, targetName, message) {
  const target = normalizeNumber(targetInput);

  if (!target || target.length < 10) return { ok: false, error: 'Nomor target gak valid.' };
  if (!targetName || targetName.trim().length === 0) return { ok: false, error: 'Nama target kosong.' };
  if (targetName.length > 30) return { ok: false, error: 'Nama target kepanjangan (max 30).' };
  if (!message || message.trim().length === 0) return { ok: false, error: 'Pesannya kosong.' };
  if (message.length > 500) return { ok: false, error: 'Pesan kepanjangan (max 500).' };
  if (!isActive(target)) return {
    ok: false,
    error: 'Target belum pernah chat bot ini, atau udah lewat 24 jam. Gak bisa kirim.',
  };

  const initials = generateInitials(targetName);
  const text =
    `💌 *Kamu dapet pesan rahasia*\n\n` +
    `Dari: *${initials}*\n\n` +
    `"${message.trim()}"\n\n` +
    `_Anonim via Panzz Bot_`;

  try {
    await sendMessage(target, text);
    try {
      stmtLog.run(senderNumber, target, targetName, initials, message.trim(), Date.now());
    } catch (dbErr) {
      console.error('[CONFESS] gagal log DB:', dbErr.message);
    }
    console.log(`[CONFESS] ${senderNumber} → ${target} (inisial: ${initials})`);
    return { ok: true, target, initials };
  } catch (e) {
    console.error('[CONFESS] gagal:', e.message);
    return { ok: false, error: `Gagal kirim: ${e.message}` };
  }
}

module.exports = { sendConfess, normalizeNumber, generateInitials };
