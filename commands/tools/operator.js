// Database prefix operator Indonesia
const OPERATORS = {
  'Telkomsel': {
    prefix: ['0811','0812','0813','0821','0822','0823','0851','0852','0853'],
    emoji: '🔴', warna: 'Merah',
  },
  'Indosat Ooredoo': {
    prefix: ['0814','0815','0816','0855','0856','0857','0858'],
    emoji: '🟡', warna: 'Kuning',
  },
  'XL Axiata': {
    prefix: ['0817','0818','0819','0859','0877','0878'],
    emoji: '🔵', warna: 'Biru',
  },
  'Tri (3)': {
    prefix: ['0895','0896','0897','0898','0899'],
    emoji: '🟣', warna: 'Ungu',
  },
  'Smartfren': {
    prefix: ['0881','0882','0883','0884','0885','0886','0887','0888','0889'],
    emoji: '🟢', warna: 'Hijau',
  },
  'Axis': {
    prefix: ['0831','0832','0833','0838'],
    emoji: '🟠', warna: 'Orange',
  },
  'by.U': {
    prefix: ['0851'], emoji: '🔴', warna: 'Merah (Telkomsel)',
  },
};

function normalizeNumber(input) {
  let num = String(input).replace(/\D/g, '');
  if (num.startsWith('62')) num = '0' + num.slice(2);
  if (num.startsWith('8')) num = '0' + num;
  return num;
}

function cekOperator(nomor) {
  const normalized = normalizeNumber(nomor);
  const prefix4 = normalized.slice(0, 4);
  for (const [nama, data] of Object.entries(OPERATORS)) {
    if (data.prefix.includes(prefix4)) return { nama, ...data };
  }
  return null;
}

module.exports = {
  name: 'operator',
  alias: ['cekoperator', 'cekno'],
  category: 'tools',
  description: 'Cek operator dari nomor HP',

  async run({ from, args, sendMessage }) {
    const nomor = args?.[0];
    if (!nomor) {
      return sendMessage(from,
        '📱 *CEK OPERATOR*\n\n' +
        '*Format:* `operator <nomor_hp>`\n\n' +
        '*Contoh:*\n' +
        '• `operator 081234567890`\n' +
        '• `operator 6281234567890`'
      );
    }

    const normalized = normalizeNumber(nomor);
    if (normalized.length < 10 || normalized.length > 13) {
      return sendMessage(from, '❌ Nomor HP gak valid (10-13 digit).');
    }

    const op = cekOperator(nomor);
    const masked = normalized.slice(0, 4) + '-****-' + normalized.slice(-4);

    if (!op) {
      return sendMessage(from,
        `📱 *CEK OPERATOR*\n\n` +
        `📞 Nomor: ${masked}\n\n` +
        `❌ Operator gak terdeteksi.\n\n` +
        `_Prefix yang gak dikenal atau nomor asing._`
      );
    }

    await sendMessage(from,
      `📱 *CEK OPERATOR*\n\n` +
      `📞 Nomor: ${masked}\n\n` +
      `${op.emoji} *Operator:* ${op.nama}\n` +
      `🎨 Warna kartu: ${op.warna}\n` +
      `🔢 Prefix: ${op.prefix.join(', ')}\n\n` +
      `_Berguna buat mastiin nomor sebelum transfer/chat._`
    );
  },
};
