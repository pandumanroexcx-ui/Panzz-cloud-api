const { addReminder, getUserReminders } = require('../../lib/reminder-store');

function parseDuration(str) {
  const match = String(str).toLowerCase().match(/^(\d+)(s|m|h|d)$/);
  if (!match) return null;
  const num = parseInt(match[1], 10);
  const mult = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 }[match[2]];
  return num * mult;
}

function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s} detik`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} menit`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam`;
  return `${Math.floor(h / 24)} hari`;
}

module.exports = {
  name: 'remind',
  alias: ['ingetin', 'alarm'],
  category: 'tools',
  description: 'Set reminder (misal: remind 5m minum obat)',

  async run({ from, args, sendMessage }) {
    if (args?.[0] === 'list') {
      const list = getUserReminders(from);
      if (!list.length) return sendMessage(from, '📭 Gak ada reminder aktif.');
      const lines = list.map((r, i) => {
        const sisa = formatDuration(r.fire_at - Date.now());
        return `${i + 1}. Dalam ${sisa}: ${r.text}`;
      });
      return sendMessage(from, `⏰ *REMINDER AKTIF*\n\n${lines.join('\n')}`);
    }

    if (!args || args.length < 2) {
      return sendMessage(from,
        '⏰ *Format:* remind <durasi> <pesan>\n\n' +
        '*Contoh:*\nremind 5m minum obat\nremind 1h meeting\n\n' +
        '*Lihat daftar:* remind list\n' +
        '*Durasi:* s, m, h, d (max 7 hari)'
      );
    }

    const delayMs = parseDuration(args[0]);
    if (!delayMs) return sendMessage(from, '❌ Durasi gak valid. Contoh: 5m, 1h, 30s');
    if (delayMs < 5000) return sendMessage(from, '❌ Minimal 5 detik.');
    if (delayMs > 7 * 24 * 60 * 60 * 1000) return sendMessage(from, '❌ Max 7 hari.');

    const text = args.slice(1).join(' ');
    if (text.length > 200) return sendMessage(from, '❌ Pesan kepanjangan (max 200).');

    addReminder(from, delayMs, text);
    await sendMessage(from,
      `✅ *Reminder di-set!*\n\n⏰ Dalam: ${formatDuration(delayMs)}\n📝 Pesan: ${text}`
    );
  },
};
