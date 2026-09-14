const { download } = require('../../lib/downloader');
const { relayUrlToMediaId } = require('../../lib/whatsapp-media');
const { sendVideo } = require('../../lib/send-message');

module.exports = {
  name: 'ttsearch',
  alias: ['tiktoksearch', 'caritiktok'],
  category: 'tools',
  description: 'Cari video TikTok dari keyword',

  async run({ from, args, sendMessage }) {
    if (!args?.[0]) {
      await sendMessage(from, '📝 Format: ttsearch <keyword>\nContoh: ttsearch kucing lucu');
      return;
    }

    const query = args.join(' ');
    await sendMessage(from, `🔍 Lagi cari TikTok: _"${query}"_...`);

    try {
      const btch = require('btch-downloader');
      const search = await btch.ttsearch?.(query);
      console.log('[TTSEARCH]', JSON.stringify(search).slice(0, 300));

      const video = search?.result?.[0] || search?.data?.[0] || search?.[0];
      if (!video) throw new Error('Video gak ketemu.');

      const videoUrl = video.url || video.link || video.videoUrl;
      if (!videoUrl) throw new Error('Gak ada link video.');

      await sendMessage(from, `🎬 Ketemu: *${video.title || query}*\n\n⏳ Lagi download...`);

      const result = await download('tiktok', videoUrl);
      if (!result.videoUrl) throw new Error('Gak ada video.');

      const mediaId = await relayUrlToMediaId(result.videoUrl, 'video/mp4', 'video.mp4');
      await sendVideo(from, mediaId, '', true);
    } catch (e) {
      console.error('[TTSEARCH] error:', e.message);
      await sendMessage(from, `❌ Gagal: ${e.message}\n\n_Catatan: fitur ini cuma works kalau btch support ttsearch_`);
    }
  },
};
