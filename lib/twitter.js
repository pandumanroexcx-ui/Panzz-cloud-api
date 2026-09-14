async function fetchTweet(tweetId) {
  const res = await fetch(
    `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&token=x&lang=en`,
    {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(15000),
    }
  );
  if (!res.ok) throw new Error(`Syndication API error (${res.status})`);
  return res.json();
}

function extractTweetId(url) {
  const match = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/i);
  return match ? match[1] : null;
}

async function downloadTwitter(url) {
  const tweetId = extractTweetId(url);
  if (!tweetId) throw new Error('URL X/Twitter gak valid.');

  const data = await fetchTweet(tweetId);

  const videoUrl = [];
  const imageUrls = [];

  const media = data.mediaDetails || [];
  for (const m of media) {
    if (m.type === 'video' || m.type === 'animated_gif') {
      // Ambil variant kualitas tertinggi
      const variants = m.video_info?.variants || [];
      const mp4s = variants.filter(v => v.content_type === 'video/mp4');
      if (mp4s.length) {
        // Sort bitrate desc
        mp4s.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
        videoUrl.push(mp4s[0].url);
      }
    } else if (m.type === 'photo') {
      imageUrls.push(m.media_url_https);
    }
  }

  // Fallback: kalau ada field photos
  if (!imageUrls.length && data.photos?.length) {
    for (const p of data.photos) imageUrls.push(p.url);
  }

  if (!videoUrl.length && !imageUrls.length) {
    throw new Error('Tweet ini gak punya media (video/gambar).');
  }

  return {
    videoUrl: videoUrl[0] || null,
    imageUrl: imageUrls[0] || null,
    allImages: imageUrls,
    title: data.text || '',
    author: data.user?.name || '',
    username: data.user?.screen_name || '',
    audioUrl: null,
  };
}

module.exports = { downloadTwitter, extractTweetId };
