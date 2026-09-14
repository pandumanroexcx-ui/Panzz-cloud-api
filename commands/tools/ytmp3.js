const { download } = require('../../lib/downloader');
const { relayUrlToMediaId } = require('../../lib/whatsapp-media');
const { sendAudio } = require('../../lib/send-message');

// Search YouTube via Invidious (gratis, no API key)
async function searchYouTube(query) {
  const instances = [
    'https://invidious.nerdvpn.de',
    'https://inv.nadeko.net',
    'https://invidious.f5.si',
  ];
  for (const base of instances) {
    try {
      const res = await fetch(`${base}/api/v1/search?q=${encodeURIComponent(query)}&type=video`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.videoId) return data[0];
    } catch (e) {
      console.log(`[YTMP3] ${base} gagal:`, e.message);
    }
  }
  return null;
}

module.exports = {
  name: 'ytmp3',
  alias: ['ytaudio', 'lagu'],
  category: 'tools',
  description: 'Download lagu dari YouTube pake judul',

  async run({ from, args, sendMessage }) {
    if (!args?.[0]) {
      await sendMessage(from,
        '📝 Format: ytmp3 <judul lagu>\n\n' +
        '*Contoh:*\n' +
        'ytmp3 Mawar Merah Slank'
      );
      return;
    }

    const query = args.join(' ');
    await sendMessage(from, `🎵 Lagi cari: _"${query}"_...`);

    try {
      const video = await searchYouTube(query);
      if (!video) throw new Error('Lagu gak ketemu. Coba judul lain.');

      const videoUrl = `https://youtu.be/${video.videoId}`;
      const title = video.title || query;

      await sendMessage(from, `🎵 Ketemu: *${title}*\n\n⏳ Lagi download audio...`);

      const result = await download('youtube', videoUrl);
      if (!result.audioUrl) throw new Error('Gak ada versi audio.');

      const mediaId = await relayUrlToMediaId(
        result.audioUrl,
        result.audioMime || 'audio/mpeg',
        `audio.${result.audioExt || 'mp3'}`
      );

      await sendAudio(from, mediaId, true);
    } catch (e) {
      console.error('[YTMP3] error:', e.message);
      await sendMessage(from, `❌ Gagal: ${e.message}`);
    }
  },
};
