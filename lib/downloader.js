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
  return {
    videoUrl: firstString(result.video, result.video_hd, result.wm, result.nowm),
    audioUrl: firstString(result.audio, result.music),
    imageUrl: null,
  };
}

async function downloadInstagram(url) {
  const raw = await btch.igdl(url);
  console.log('[DEBUG instagram]', JSON.stringify(raw));
  const item = raw?.result?.[0];
  const mediaUrl = item?.url;
  const isVideo = mediaUrl && /\.mp4(\?|$)/i.test(mediaUrl);
  const isImage = mediaUrl && /\.(jpg|jpeg|png|webp)(\?|$)/i.test(mediaUrl);
  return {
    videoUrl: isVideo ? mediaUrl : null,
    imageUrl: isImage ? mediaUrl : null,
    audioUrl: null,
  };
}

async function downloadFacebook(url) {
  const result = await btch.fbdown(url);
  return { videoUrl: firstString(result.Normal_video, result.HD), audioUrl: null, imageUrl: null };
}

async function downloadYoutube(url) {
  const result = await btch.youtube(url);
  console.log('[DEBUG youtube]', JSON.stringify(result));
  return {
    videoUrl: firstString(result.mp4, result.video, result.video_url, result.url),
    audioUrl: firstString(result.mp3, result.audio, result.audio_url),
    imageUrl: null,
  };
}

async function downloadCapcut(url) {
  const result = await btch.capcut(url);
  console.log('[DEBUG capcut]', JSON.stringify(result));
  return {
    videoUrl: firstString(result.video, result.video_url, result.url, result.data?.video),
    audioUrl: null,
    imageUrl: null,
  };
}

async function downloadDouyin(url) {
  const result = await btch.douyin(url);
  console.log('[DEBUG douyin]', JSON.stringify(result));
  return {
    videoUrl: firstString(result.video, result.video_hd, result.nowm, result.url),
    audioUrl: firstString(result.audio, result.music),
    imageUrl: null,
  };
}

async function download(platform, url) {
  switch (platform) {
    case 'tiktok': return downloadTiktok(url);
    case 'instagram': return downloadInstagram(url);
    case 'facebook': return downloadFacebook(url);
    case 'youtube': return downloadYoutube(url);
    case 'capcut': return downloadCapcut(url);
    case 'douyin': return downloadDouyin(url);
    default:
      throw new Error(`Platform "${platform}" belum didukung.`);
  }
}

module.exports = { download };
