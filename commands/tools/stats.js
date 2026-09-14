const { getAllActive } = require('../../lib/confess-store');

const startTime = Date.now();
const stats = {
  messagesReceived: 0,
  commandsUsed: new Map(),
};

function recordMessage() {
  stats.messagesReceived++;
}

function recordCommand(name) {
  stats.commandsUsed.set(name, (stats.commandsUsed.get(name) || 0) + 1);
}

function formatUptime(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}j ${m}m ${sec}d`;
  if (m > 0) return `${m}m ${sec}d`;
  return `${sec}d`;
}

module.exports = {
  name: 'stats',
  alias: ['info', 'status'],
  category: 'tools',
  description: 'Statistik bot',
  recordMessage,
  recordCommand,

  async run({ from, sendMessage }) {
    let totalCmd = 0;
    try {
      const commands = require('../index');
      if (commands && typeof commands.values === 'function') {
        totalCmd = new Set([...commands.values()].map(c => c && c.name).filter(Boolean)).size;
      }
    } catch (e) {
      console.log('[STATS] gagal baca commands:', e.message);
    }

    let activeUsers = 0;
    try {
      activeUsers = getAllActive().length;
    } catch (e) {}

    const sorted = [...stats.commandsUsed.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topList = sorted.length
      ? sorted.map(([n, c], i) => `${i + 1}. .${n} — ${c}x`).join('\n')
      : '(belum ada)';

    await sendMessage(from,
      `📊 *STATISTIK PANZZ BOT*\n\n` +
      `⏱️ Uptime: ${formatUptime(Date.now() - startTime)}\n` +
      `📥 Pesan masuk: ${stats.messagesReceived}\n` +
      `👥 User aktif (24j): ${activeUsers}\n` +
      `🎮 Total command: ${totalCmd}\n\n` +
      `🏆 *Top Command:*\n${topList}`
    );
  },
};
