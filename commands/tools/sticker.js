const { uploadSticker } = require('../../lib/whatsapp-media');
const { imageToSticker } = require('../../lib/sticker');
const { sendSticker } = require('../../lib/send-message');

// Resolve redirect + extract og:image kalau HTML
async function resolveImageUrl(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36',
      'Accept': 'image/*,text/html',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Gagal fetch (${res.status})`);

  const contentType = res.headers.get('content-type') || '';

  // Kalau langsung gambar
  if (contentType.startsWith('image/')) {
    const buf = Buffer.from(await res.arrayBuffer());
    return { buffer: buf, sourceUrl: url };
  }

  // Kalau HTML → extract og:image
  if (contentType.includes('text/html')) {
    const html = await res.text();
    const match = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (!match) throw new Error('Gak ketemu gambar di halaman itu.');
    const imgUrl = match[1];
    const imgRes = await fetch(imgUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(15000),
    });
    if (!imgRes.ok) throw new Error(`Gagal download gambar (${imgRes.status})`);
    const buf = Buffer.from(await imgRes.arrayBuffer());
    return { buffer: buf, sourceUrl: imgUrl };
  }

  throw new Error(`Content-type gak didukung: ${contentType}`);
}

module.exports = {
  name: 'sticker',
  alias: ['stiker', 'stikerin'],
  category: 'tools',
  description: 'Bikin sticker dari link gambar (support Pinterest, IG, dll)',

  async run({ from, args, sendMessage }) {
    if (!args?.[0] || !args[0].startsWith('http')) {
      return sendMessage(from, '📝 Format: sticker <url_gambar>\nContoh: sticker https://i.imgur.com/xxx.jpg');
    }

    await sendMessage(from, '🎨 Lagi bikin sticker...');

    try {
      const { buffer } = await resolveImageUrl(args[0]);
      if (buffer.length < 1000) throw new Error('Gambar kekecilan / link rusak.');

      const webpBuffer = await imageToSticker(buffer);
      const mediaId = await uploadSticker(webpBuffer);
      await sendSticker(from, mediaId);
    } catch (e) {
      console.error('[STICKER]', e.message);
      await sendMessage(from, `⚠️ Gagal bikin sticker.\n\n_${e.message}_`);
    }
  },
};
