const btch = require('btch-downloader');

async function downloadTiktok(url) {
  const result = await btch.ttdl(url);
  return {
    videoUrl: result.video?.[0] || result.video_hd || result.wm,
    audioUrl: result.audio || result.music,
  };
}

async function downloadInstagram(url) {
  const result = await btch.igdl(url);
  const item = Array.isArray(result) ? result[0] : result;
  return { videoUrl: item?.url || item?.video, audioUrl: null };
}

async function downloadYoutubeVideo(url) {
  const result = await btch.ytmp4(url);
  return { videoUrl: result.url || result.download, audioUrl: null };
}

async function downloadYoutubeAudio(url) {
  const result = await btch.ytmp3(url);
  return { videoUrl: null, audioUrl: result.url || result.download };
}

async function downloadFacebook(url) {
  const result = await btch.fbdown(url);
  return { videoUrl: result.Normal_video || result.HD, audioUrl: null };
}

async function download(platform, url, format) {
  switch (platform) {
    case 'tiktok':
      return downloadTiktok(url);
    case 'instagram':
      return downloadInstagram(url);
    case 'youtube':
      return format === 'mp3' ? downloadYoutubeAudio(url) : downloadYoutubeVideo(url);
    case 'facebook':
      return downloadFacebook(url);
    default:
      throw new Error(`Platform "${platform}" belum didukung sepenuhnya. Coba platform lain dulu.`);
  }
}

module.exports = { download };
