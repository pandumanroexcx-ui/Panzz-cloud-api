const fs = require('fs');
const path = require('path');
const { uploadImage } = require('../../lib/whatsapp-media');

module.exports = {
  name: 'menu',
  alias: ['help'],
  category: 'general',
  description: 'Menu interaktif dengan tombol kategori',

  async run({ sendImage, sendList, from, commands }) {
    const categories = [...new Set([...commands.values()].map((c) => c.category).filter(Boolean))].sort();

    // 1. Baca gambar lokal dari folder assets
    const imagePath = path.join(__dirname, '../../assets/b765eb46-6613-4453-b367-2aa480bdb19d.jpeg');
    const imageBuffer = fs.readFileSync(imagePath);

    // 2. Upload gambar ke WhatsApp Media
    const mediaId = await uploadImage(imageBuffer);
    await sendImage(from, mediaId, '🤖 Selamat datang di PanzzBot!');

    // 3. Kirim List Tombol Kategori
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
