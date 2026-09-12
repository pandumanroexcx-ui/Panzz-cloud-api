const btch = require('btch-downloader');

function firstString(...candidates) {
  for (const c of candidates) {
    if (typeof c === 'string' && c) return c;
    if (Array.isArray(c) && typeof c[0] === 'string' && c[0]) return c[0];
  }
  return null;
}

async function downloadTiktok(url) {
  const result = await btch.ttdl(url);
  console.log('[DEBUG tiktok]', JSON.stringify(result));
  return {
    videoUrl: firstString(result.video, result.video_hd, result.wm, result.nowm),
    audioUrl: firstString(result.audio, result.music),
  };
}

async function downloadInstagram(url) {
  const result = await btch.igdl(url);
  console.log('[DEBUG instagram]', JSON.stringify(result));
  const item = Array.isArray(result) ? result[0] : result;
  return {
    videoUrl: firstString(item?.url, item?.video, item?.video_url),
    audioUrl: null,
  };
}

async function downloadYoutubeVideo(url) {
  const result = await btch.ytmp4(url);
  console.log('[DEBUG youtube video]', JSON.stringify(result));
  return { videoUrl: firstString(result.url, result.download), audioUrl: null };
}

async function downloadYoutubeAudio(url) {
  const result = await btch.ytmp3(url);
  console.log('[DEBUG youtube audio]', JSON.stringify(result));
  return { videoUrl: null, audioUrl: firstString(result.url, result.download) };
}

async function downloadFacebook(url) {
  const result = await btch.fbdown(url);
  console.log('[DEBUG facebook]', JSON.stringify(result));
  return { videoUrl: firstString(result.Normal_video, result.HD), audioUrl: null };
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
      throw new Error(`Platform "${platform}" belum didukung sepenuhnya.`);
  }
}

module.exports = { download };
