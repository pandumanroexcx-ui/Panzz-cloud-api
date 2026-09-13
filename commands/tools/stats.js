const { getAllActive } = require('../../lib/confess-store');
const commands = require('../index');

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
    const totalCmd = new Set([...commands.values()].map(c => c.name)).size;
    const activeUsers = getAllActive().length;

    // Top 5 command
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
