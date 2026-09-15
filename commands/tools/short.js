module.exports = {
  name: 'short',
  alias: ['shortlink', 'pendek', 'pendekin'],
  category: 'tools',
  description: 'Pendekin link panjang',

  async run({ from, args, sendMessage }) {
    if (!args?.[0] || !args[0].startsWith('http')) {
      return sendMessage(from, '📝 Format: short <url>\nContoh: short https://youtube.com/watch?v=xxxxx');
    }

    await sendMessage(from, '🔗 Lagi dipendekin...');

    const originalUrl = args[0];

    try {
      // Coba pake is.gd dulu
      const longUrl = encodeURIComponent(originalUrl);
      const res = await fetch(`https://is.gd/create.php?format=json&url=${longUrl}`, {
        signal: AbortSignal.timeout(10000),
      });
      const data = await res.json();

      if (data.errorcode) throw new Error(data.errormessage || 'Gagal pendekin');
      const shortUrl = data.shorturl;
      if (!shortUrl) throw new Error('Gak dapet shortlink');

      await sendMessage(from, `🔗 *Link pendek:*\n${shortUrl}\n\n_Asli: ${originalUrl.slice(0, 80)}${originalUrl.length > 80 ? '...' : ''}_`);
    } catch (e) {
      console.error('[SHORT] is.gd error:', e.message);
      // Fallback ke tinyurl
      try {
        const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(originalUrl)}`, {
          signal: AbortSignal.timeout(10000),
        });
        const text = await res.text();
        if (res.ok && text.startsWith('http')) {
          await sendMessage(from, `🔗 *Link pendek:*\n${text}\n\n_Asli: ${originalUrl.slice(0, 80)}${originalUrl.length > 80 ? '...' : ''}_`);
          return;
        }
      } catch (e2) {
        console.error('[SHORT] tinyurl error:', e2.message);
      }
      await sendMessage(from, '⚠️ Gagal pendekin link. Pastiin link-nya valid ya 🙏');
    }
  },
};
