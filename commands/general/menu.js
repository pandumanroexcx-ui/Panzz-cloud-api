const { generateBanner } = require('../../lib/banner');
const { uploadImage } = require('../../lib/whatsapp-media');

module.exports = {
  name: 'menu',
  alias: ['help'],
  category: 'general',
  description: 'Menu interaktif dengan tombol kategori',

  async run({ sendMessage, sendImage, sendList, from, commands }) {
    const categories = [...new Set([...commands.values()].map((c) => c.category).filter(Boolean))].sort();
    const totalCmd = new Set([...commands.values()].map((c) => c.name)).size;

    const png = await generateBanner('MENU BOT', `${totalCmd} command tersedia`);
    const mediaId = await uploadImage(png);
    await sendImage(from, mediaId, '🤖 Selamat datang di PanzzBot!');

    const rows = categories.map((cat) => ({
      id: `cat:${cat}`,
      title: cat.toUpperCase(),
      description: `Lihat command kategori ${cat}`,
    }));

    await sendList(from, {
      header: 'Kategori Command',
      body: 'Tap tombol di bawah buat pilih kategori:',
      footer: 'PanzzBot',
      buttonText: 'Pilih Kategori',
      sections: [{ title: 'Kategori', rows }],
    });
  },
};
