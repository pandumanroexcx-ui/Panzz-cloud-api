module.exports = {
  name: 'cuaca',
  alias: ['weather'],
  category: 'tools',
  description: 'Cek cuaca kota. Contoh: cuaca Jakarta',

  async run({ sendMessage, from, args }) {
    const city = args.join(' ');
    if (!city) {
      return sendMessage(from, 'Contoh: cuaca Jakarta');
    }
    try {
      const res = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=%l:+%C+%t+(terasa+%f)+Kelembapan:%h+Angin:%w`);
      const text = await res.text();
      await sendMessage(from, `🌤️ ${text}`);
    } catch (e) {
      await sendMessage(from, 'Gagal ambil data cuaca, coba lagi.');
    }
  },
};
