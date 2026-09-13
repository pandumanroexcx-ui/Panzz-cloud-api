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
  if (!mediaUrl) throw new Error('Ga bisa ambil media dari IG ini.');

  const isReel = /\/reel\//i.test(url) || /\/reels\//i.test(url);
  const isVideoByExt = /\.mp4(\?|$)/i.test(mediaUrl);
  const isImageByExt = /\.(jpg|jpeg|png|webp)(\?|$)/i.test(mediaUrl);
  const isVideo = isReel || isVideoByExt;
  const isImage = !isReel && (isImageByExt || !isVideoByExt);

  return {
    videoUrl: isVideo ? mediaUrl : null,
    imageUrl: isImage ? mediaUrl : null,
    audioUrl: null,
  };
}

async function downloadFacebook(url) {
  const result = await btch.fbdown(url);
  return {
    videoUrl: firstString(result.Normal_video, result.HD, result.video, result.url),
    audioUrl: null,
    imageUrl: null,
  };
}

async function downloadYoutube(url) {
  const result = await btch.youtube(url);
  console.log('[DEBUG youtube]', JSON.stringify(result));
  return {
    videoUrl: firstString(result.mp4, result.video, result.video_url, result.url),
    audioUrl: firstString(result.mp3, result.audio, result.audio_url),
    imageUrl: null,
    audioMime: 'audio/mp4',
    audioExt: 'm4a',
  };
}

async function downloadCapcut(url) {
  const result = await btch.capcut(url);
  console.log('[DEBUG capcut]', JSON.stringify(result));
  const vid = firstString(result.originalVideoUrl, result.video, result.video_url, result.url);
  if (!vid) throw new Error('Ga bisa ambil video dari CapCut ini.');
  return {
    videoUrl: vid,
    audioUrl: null,
    imageUrl: result.coverUrl || null,
  };
}

async function downloadDouyin(url) {
  const result = await btch.douyin(url);
  console.log('[DEBUG douyin]', JSON.stringify(result));
  const data = result?.result?.data || result?.result || result?.data || result;
  const links = data?.links || [];

  if (!links.length) {
    const direct = firstString(data?.video, data?.video_hd, data?.nowm, data?.url);
    if (direct) return { videoUrl: direct, audioUrl: null, imageUrl: null };
    throw new Error('Server Douyin lagi error, coba lagi nanti.');
  }

  const videoHD = links.find(l => /quality 2/i.test(l.quality))?.url;
  const videoSD = links.find(l => /quality 1/i.test(l.quality))?.url;
  const audio   = links.find(l => /quality 3/i.test(l.quality))?.url;

  return {
    videoUrl: videoHD || videoSD || null,
    audioUrl: audio || null,
    imageUrl: data?.thumbnail || null,
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
