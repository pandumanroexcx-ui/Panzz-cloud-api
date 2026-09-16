const fs = require('fs');
const path = require('path');
const { uploadImage } = require('../../lib/whatsapp-media');

const CATEGORY_EMOJI = {
  general: '📋',
  fun: '🎮',
  tools: '🛠️',
  ai: '🤖',
  downloader: '📥',
};

module.exports = {
  name: 'menu',
  alias: ['help', 'bantuan'],
  category: 'general',
  description: 'Menu interaktif dengan tombol kategori',

  async run({ sendImage, sendList, from, commands }) {
    const categories = [...new Set([...commands.values()].map((c) => c.category).filter(Boolean))].sort();

    // Hitung jumlah command per kategori
    const counts = {};
    for (const c of commands.values()) {
      if (!c.category) continue;
      if (!counts[c.category]) counts[c.category] = new Set();
      counts[c.category].add(c.name);
    }

    // Baca gambar lokal
    const imagePath = path.join(__dirname, '../../assets/fotomenu.jpeg');
    let mediaId = null;
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      mediaId = await uploadImage(imageBuffer);
      await sendImage(from, mediaId, '👋 *Welcome to PanzzBot!*\n\nKetik *.help <command>* buat liat detail command.\nContoh: *.help kuis*');
    } catch (e) {
      console.error('Gagal kirim gambar menu:', e.message);
    }

    // Kirim list kategori
    const rows = categories.map((cat) => {
      const emoji = CATEGORY_EMOJI[cat] || '📁';
      const total = counts[cat]?.size || 0;
      return {
        id: `cat:${cat}`,
        title: `${emoji} ${cat.toUpperCase()} (${total})`,
        description: `Lihat ${total} command kategori ${cat}`,
      };
    });

    await sendList(from, {
      header: '📚 Kategori Command',
      body: 'Tap tombol di bawah buat pilih kategori:',
      footer: 'PanzzBot v1.0',
      buttonText: 'Pilih Kategori',
      sections: [{ title: 'Kategori', rows }],
    });
  },
};
