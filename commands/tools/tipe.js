const PREFIX_HP = [
  '0811','0812','0813','0821','0822','0823','0851','0852','0853',
  '0814','0815','0816','0855','0856','0857','0858',
  '0817','0818','0819','0859','0877','0878',
  '0895','0896','0897','0898','0899',
  '0881','0882','0883','0884','0885','0886','0887','0888','0889',
  '0831','0832','0833','0838',
];

module.exports = {
  name: 'tipe',
  alias: ['jenisnomor', 'tipenomor'],
  category: 'tools',
  description: 'Deteksi tipe nomor telepon Indonesia',

  async run({ from, args, sendMessage }) {
    const input = args?.[0];
    if (!input) {
      return sendMessage(from,
        '📱 *DETEKSI TIPE NOMOR*\n\n' +
        '*Format:* `tipe <nomor>`\n\n' +
        '*Contoh:*\n' +
        '• `tipe 08123456789`\n' +
        '• `tipe 021-1234567`\n' +
        '• `tipe 021-500-xxx`\n' +
        '• `tipe 0800-xxx`'
      );
    }

    let num = String(input).replace(/\D/g, '');
    if (num.startsWith('62')) num = '0' + num.slice(2);
    if (num.startsWith('8')) num = '0' + num;

    let tipe = '❓ Tidak dikenal';
    let emoji = '❓';
    let detail = '';
    let area = '';

    if (num.length < 7) return sendMessage(from, '❌ Nomor terlalu pendek.');

    // HP
    const prefix4 = num.slice(0, 4);
    if (PREFIX_HP.includes(prefix4)) {
      tipe = 'HP / Seluler';
      emoji = '📱';
      detail = `Prefix: ${prefix4}`;
    }
    // Fixed Line Jakarta
    else if (num.startsWith('021')) {
      tipe = 'Telepon Tetap (Jakarta)';
      emoji = '☎️';
      area = 'Jakarta, Bekasi, Depok, Tangerang';
    }
    else if (num.startsWith('022')) {
      tipe = 'Telepon Tetap';
      emoji = '☎️';
      area = 'Bandung, Cimahi';
    }
    else if (num.startsWith('031')) {
      tipe = 'Telepon Tetap';
      emoji = '☎️';
      area = 'Surabaya, Gresik, Sidoarjo';
    }
    else if (num.startsWith('024')) {
      tipe = 'Telepon Tetap';
      emoji = '☎️';
      area = 'Semarang';
    }
    else if (num.startsWith('0274')) {
      tipe = 'Telepon Tetap';
      emoji = '☎️';
      area = 'Yogyakarta';
    }
    else if (num.startsWith('0361')) {
      tipe = 'Telepon Tetap';
      emoji = '☎️';
      area = 'Denpasar, Bali';
    }
    // Layanan khusus
    else if (num.startsWith('0800')) {
      tipe = 'Nomor Bebas Pulsa / Layanan';
      emoji = '📞';
      detail = 'Biasanya buat call center/layanan pelanggan';
    }
    else if (num.startsWith('0808')) {
      tipe = 'Nomor Premium / Berbayar';
      emoji = '💰';
      detail = 'Dikenakan tarif khusus';
    }
    else if (num.startsWith('0809')) {
      tipe = 'Nomor Premium';
      emoji = '💰';
    }
    else if (num.startsWith('0900')) {
      tipe = 'Layanan Berbayar (Premium)';
      emoji = '💸';
    }
    else if (num.startsWith('177')) {
      tipe = 'Nomor Layanan';
      emoji = '📞';
    }
    else if (num.startsWith('112') || num.startsWith('110') || num.startsWith('113') || num.startsWith('118') || num.startsWith('119')) {
      tipe = 'Nomor Darurat / Layanan Publik';
      emoji = '🚨';
      const layanan = { '112': 'Darurat Umum', '110': 'Polisi', '113': 'Pemadam Kebakaran', '118': 'Ambulans', '119': 'Layanan Kesehatan' };
      detail = layanan[num.slice(0, 3)];
    }
    // HP prefix lain
    else if (num.startsWith('08')) {
      tipe = 'HP / Seluler';
      emoji = '📱';
      detail = 'Prefix gak terdeteksi spesifik';
    }

    const masked = num.length >= 8
      ? num.slice(0, 4) + '-****-' + num.slice(-4)
      : num;

    let text = `📱 *DETEKSI TIPE NOMOR*\n\n`;
    text += `📞 Nomor: \`${masked}\`\n`;
    text += `${emoji} *Tipe:* ${tipe}\n`;
    if (detail) text += `ℹ️ ${detail}\n`;
    if (area) text += `📍 Area: ${area}\n`;
    text += `📏 Panjang: ${num.length} digit`;

    await sendMessage(from, text);
  },
};
