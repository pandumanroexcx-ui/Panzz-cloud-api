const { sendMessage } = require('../../lib/send-message');
const { setPending, getPending, clearPending } = require('../../lib/pending-downloads');

function parseDuration(str) {
  const m = String(str).toLowerCase().match(/^(\d+)(s|m|h)?$/);
  if (!m) return null;
  const num = parseInt(m[1], 10);
  const unit = m[2] || 'm';
  return num * { s: 1000, m: 60000, h: 3600000 }[unit];
}

module.exports = {
  name: 'pomodoro',
  alias: ['pomo', 'timer', 'fokus'],
  category: 'tools',
  description: 'Timer pomodoro untuk fokus',

  async run({ from, args, sendMessage: send, sendMessage, message }) {
    const sub = (args?.[0] || '').toLowerCase();
    const key = `pomo:${from}`;

    if (sub === 'stop' || sub === 'batal') {
      const pending = getPending(key);
      if (pending?.timeoutId) clearTimeout(pending.timeoutId);
      clearPending(key);
      return sendMessage(from, '🛑 Pomodoro dihentikan.');
    }

    // Default 25 menit kalau tanpa argumen
    let durationMs = 25 * 60000;
    let label = '25 menit (Pomodoro standar)';

    if (sub && sub !== 'start') {
      const parsed = parseDuration(args[0]);
      if (!parsed) {
        return sendMessage(from,
          '⏱️ *POMODORO TIMER*\n\n' +
          '• `pomodoro` — 25 menit standar\n' +
          '• `pomodoro 15m` — 15 menit\n' +
          '• `pomodoro 45m` — 45 menit\n' +
          '• `pomodoro 30s` — 30 detik (test)\n' +
          '• `pomodoro stop` — batal'
        );
      }
      if (parsed < 5000) return sendMessage(from, '❌ Minimal 5 detik.');
      if (parsed > 4 * 3600000) return sendMessage(from, '❌ Max 4 jam.');
      durationMs = parsed;
      label = args[0];
    }

    const menit = Math.round(durationMs / 60000);
    const detik = Math.round(durationMs / 1000);

    await sendMessage(from,
      `🍅 *POMODORO DIMULAI!*\n\n` +
      `⏱️ Durasi: ${label}\n` +
      `🎯 Fokus sekarang, jangan buka sosmed!\n\n` +
      `_Bot bakal kirim notif kalau udah selesai._\n` +
      `_Ketik \`pomodoro stop\` buat batal._`
    );

    const timeoutId = setTimeout(async () => {
      try {
        await sendMessage(from,
          `🔔 *POMODORO SELESAI!*\n\n` +
          `⏱️ Waktu ${label} udah habis.\n\n` +
          `✅ Istirahat 5 menit, terus lanjut!\n` +
          `💪 Kamu hebat udah fokus!`
        );
      } catch (e) {
        console.error('[POMO]', e.message);
      }
      clearPending(key);
    }, durationMs);

    setPending(key, { timeoutId, durationMs });
  },
};
