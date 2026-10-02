const { getStats } = require('../../lib/activity-tracker');
const { getMemory } = require('../../lib/memory');

function formatDurasi(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const d = Math.floor(s / 86400);
  if (d > 0) return `${d} hari`;
  if (h > 0) return `${h} jam`;
  if (m > 0) return `${m} menit`;
  return `${s} detik`;
}

module.exports = {
  name: 'statistik',
  alias: ['statsku', 'myStats'],
  category: 'tools',
  description: 'Statistik personal kamu',

  async run({ from, sendMessage }) {
    const stats = getStats(from);
    if (!stats) return sendMessage(from, '📊 Belum ada data. Chat dulu ya 😄');

    const memory = getMemory(from);
    const firstDate = new Date(stats.firstChat + 7 * 3600000);
    const firstStr = `${firstDate.getUTCDate()}/${firstDate.getUTCMonth() + 1}/${firstDate.getUTCFullYear()}`;

    let text = `📊 *STATISTIK KAMU*\n\n`;
    text += `📅 Kenalan pertama: ${firstStr}\n`;
    text += `💬 Total chat: *${stats.totalMessages.toLocaleString('id-ID')}x*\n`;
    text += `📆 Hari aktif: *${stats.totalDays}*\n`;
    text += `🔥 Streak: *${stats.streak} hari*\n`;
    text += `⏰ Terakhir: ${formatDurasi(Date.now() - stats.lastChat)} lalu\n`;

    if (memory && Object.keys(memory).length) {
      text += `\n🧠 *Yang aku inget tentang kamu:*\n`;
      for (const [k, v] of Object.entries(memory)) {
        text += `• ${k}: ${v}\n`;
      }
    }

    if (stats.streak >= 7) text += `\n🏆 *Kamu setia banget!* Streak ${stats.streak} hari!`;
    else if (stats.streak >= 3) text += `\n💪 Streak ${stats.streak} hari, lanjut terus!`;

    await sendMessage(from, text);
  },
};
