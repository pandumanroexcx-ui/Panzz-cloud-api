const { download } = require('../../lib/downloader');
const { relayUrlToMediaId } = require('../../lib/whatsapp-media');
const { sendVideo } = require('../../lib/send-message');

// Search TikTok via TikWM API (gratis, no API key)
async function searchTikTok(query) {
  const url = `https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(query)}&count=1&cursor=0&web=1`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`TikWM error (${res.status})`);
  const data = await res.json();
  if (data.code !== 0) throw new Error(data.msg || 'TikWM gagal');
  return data.data?.videos?.[0];
}

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
      const video = await searchTikTok(query);
      if (!video) throw new Error('Video gak ketemu.');

      const videoUrl = video.play || video.wmplay;
      if (!videoUrl) throw new Error('Gak ada link video.');

      await sendMessage(from, `🎬 Ketemu: *${video.title || query}*\n\n⏳ Lagi download...`);

      const mediaId = await relayUrlToMediaId(videoUrl, 'video/mp4', 'video.mp4');
      await sendVideo(from, mediaId, '', true);
    } catch (e) {
      console.error('[TTSEARCH] error:', e.message);
      await sendMessage(from, `❌ Gagal: ${e.message}`);
    }
  },
};
