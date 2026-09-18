function bikinSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // hapus diacritics
    .replace(/[^a-z0-9\s-]/g, '')     // hapus karakter selain alfanumerik
    .trim()
    .replace(/\s+/g, '-')             // spasi jadi -
    .replace(/-+/g, '-');              // multiple - jadi 1
}

module.exports = {
  name: 'slug',
  alias: ['slugify', 'permalink'],
  category: 'tools',
  description: 'Bikin slug dari judul (buat URL)',

  async run({ from, args, sendMessage }) {
    const text = args.join(' ').trim();
    if (!text) return sendMessage(from, '🔗 Format: `slug <judul>`\nContoh: `slug Cara Membuat Bot WhatsApp`');
    if (text.length > 200) return sendMessage(from, '❌ Max 200 karakter.');

    const slug = bikinSlug(text);
    await sendMessage(from,
      `🔗 *SLUG GENERATOR*\n\n` +
      `📝 Input: ${text}\n\n` +
      `✅ Slug:\n\`${slug}\`\n\n` +
      `_Cocok buat URL artikel/blog_`
    );
  },
};
