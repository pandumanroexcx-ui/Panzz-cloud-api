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

    try {
      const longUrl = encodeURIComponent(args[0]);
      const res = await fetch(`https://is.gd/create.php?format=json&url=${longUrl}`, {
        signal: AbortSignal.timeout(10000),
      });
      const data = await res.json();

      if (data.errorcode) throw new Error(data.errormessage || 'Gagal pendekin');
      const shortUrl = data.shorturl;
      if (!shortUrl) throw new Error('Gak dapet shortlink');

      await sendMessage(from, `🔗 *Link pendek:*\n${shortUrl}\n\n_Asli: ${args[0].slice(0, 80)}${args[0].length > 80 ? '...' : ''}_`);
    } catch (e) {
      console.error('[SHORT]', e.message);
      await sendMessage(from, '⚠️ Gagal pendekin link, coba lagi 🙏');
    }
  },
};
