module.exports = {
  name: 'cek',
  alias: ['check', 'cekweb'],
  category: 'tools',
  description: 'Cek website hidup atau nggak',

  async run({ from, args, sendMessage }) {
    if (!args?.[0]) {
      await sendMessage(from, '📝 Format: cek <url>\nContoh: cek https://google.com');
      return;
    }

    let url = args[0];
    if (!url.startsWith('http')) url = 'https://' + url;

    await sendMessage(from, '🔍 Lagi cek...');

    const start = Date.now();
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0 PanzzBot/1.0' },
        signal: AbortSignal.timeout(10000),
      });
      const ms = Date.now() - start;
      const status = res.status;
      const ok = res.ok ? '✅' : '⚠️';

      await sendMessage(from,
        `${ok} *STATUS WEBSITE*\n\n` +
        `🌐 URL: ${url}\n` +
        `📊 Status: ${status}\n` +
        `⚡ Respon: ${ms} ms\n` +
        `📡 Content-Type: ${res.headers.get('content-type') || '-'}`
      );
    } catch (e) {
      const ms = Date.now() - start;
      await sendMessage(from,
        `❌ *WEBSITE DOWN / ERROR*\n\n` +
        `🌐 URL: ${url}\n` +
        `⚡ Respon: ${ms} ms\n` +
        `💬 Error: ${e.message}`
      );
    }
  },
};
