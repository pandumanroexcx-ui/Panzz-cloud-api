const BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const HARI = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];

module.exports = {
  name: 'timestamp',
  alias: ['ts', 'unix'],
  category: 'tools',
  description: 'Konversi timestamp ↔ tanggal',

  async run({ from, args, sendMessage }) {
    const input = (args?.[0] || '').trim();

    if (!input) {
      const now = Math.floor(Date.now() / 1000);
      return sendMessage(from,
        `⏱️ *TIMESTAMP SEKARANG*\n\n` +
        `🔹 Unix: \`${now}\`\n` +
        `🔹 Milidetik: \`${Date.now()}\`\n\n` +
        `_Convert: \`timestamp 1735689600\`_`
      );
    }

    const num = parseInt(input, 10);
    if (isNaN(num)) {
      // Coba parse sebagai tanggal
      const d = new Date(input);
      if (isNaN(d.getTime())) return sendMessage(from, '❌ Format salah.');
      return sendMessage(from,
        `⏱️ *CONVERT TO TIMESTAMP*\n\n` +
        `📅 Input: ${input}\n` +
        `🔹 Unix: \`${Math.floor(d.getTime() / 1000)}\`\n` +
        `🔹 Milidetik: \`${d.getTime()}\``
      );
    }

    // Unix timestamp (detik atau milidetik)
    const ms = num > 9999999999 ? num : num * 1000;
    const d = new Date(ms);
    const wib = new Date(d.getTime() + 7 * 60 * 60 * 1000);

    await sendMessage(from,
      `⏱️ *CONVERT FROM TIMESTAMP*\n\n` +
      `🔹 Input: \`${num}\`\n\n` +
      `📅 UTC: ${d.toUTCString()}\n` +
      `🇮🇩 WIB: ${HARI[wib.getUTCDay()]}, ${wib.getUTCDate()} ${BULAN[wib.getUTCMonth()]} ${wib.getUTCFullYear()} ${String(wib.getUTCHours()).padStart(2,'0')}:${String(wib.getUTCMinutes()).padStart(2,'0')}:${String(wib.getUTCSeconds()).padStart(2,'0')}`
    );
  },
};
