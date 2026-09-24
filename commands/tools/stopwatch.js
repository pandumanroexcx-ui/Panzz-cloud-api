const { sendMessage } = require('../../lib/send-message');
const { setPending, getPending, clearPending } = require('../../lib/pending-downloads');

function formatDurasi(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const cs = Math.floor((ms % 1000) / 10);
  if (h > 0) return `${h}j ${m}m ${sec}d`;
  if (m > 0) return `${m}m ${sec}d`;
  return `${sec},${String(cs).padStart(2, '0')}d`;
}

module.exports = {
  name: 'stopwatch',
  alias: ['sw', 'timer2'],
  category: 'tools',
  description: 'Stopwatch (hitung naik)',

  async run({ from, args, sendMessage: send, sendMessage }) {
    const sub = (args?.[0] || '').toLowerCase();
    const key = `sw:${from}`;

    if (sub === 'stop' || sub === 'selesai') {
      const pending = getPending(key);
      if (!pending) return sendMessage(from, '❌ Gak ada stopwatch aktif.');
      const durasi = Date.now() - pending.start;
      clearPending(key);
      return sendMessage(from,
        `⏱️ *STOPWATCH SELESAI*\n\n` +
        `Total: *${formatDurasi(durasi)}*\n` +
        `_(${Math.floor(durasi / 1000)} detik)_`
      );
    }

    if (sub === 'cek' || sub === 'check') {
      const pending = getPending(key);
      if (!pending) return sendMessage(from, '❌ Gak ada stopwatch aktif. Mulai: `stopwatch start`');
      return sendMessage(from, `⏱️ *Berjalan:* ${formatDurasi(Date.now() - pending.start)}`);
    }

    // Start
    const pending = getPending(key);
    if (pending) return sendMessage(from, `⚠️ Stopwatch udah jalan: ${formatDurasi(Date.now() - pending.start)}\n\nKetik \`stopwatch stop\` buat stop.`);

    setPending(key, { start: Date.now() });
    await sendMessage(from,
      `⏱️ *STOPWATCH DIMULAI*\n\n` +
      `🕐 Mulai: ${new Date().toLocaleTimeString('id-ID')}\n\n` +
      `Ketik \`stopwatch stop\` kalo udah selesai.\n` +
      `Atau \`stopwatch cek\` buat liat durasi sementara.`
    );
  },
};
