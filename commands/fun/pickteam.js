function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

module.exports = {
  name: 'pickteam',
  alias: ['bagitim', 'timrandom'],
  category: 'fun',
  description: 'Bagi tim random',

  async run({ from, args, sendMessage }) {
    const jumlahTim = parseInt(args?.[0], 10);
    if (!jumlahTim || jumlahTim < 2 || jumlahTim > 5) {
      return sendMessage(from,
        '👥 *BAGI TIM*\n\n' +
        'Format: `pickteam <jumlah_tim> <nama1> <nama2> ...`\n' +
        'Atau: `pickteam <jumlah_tim> nama1 | nama2 | nama3`\n\n' +
        '*Contoh:*\n' +
        '• `pickteam 2 Andi | Budi | Sari | Rina`\n' +
        '• `pickteam 3 Panzz, Sarah, Ari, Doni, Eka, Fajar`'
      );
    }

    const raw = args.slice(1).join(' ');
    let names;
    if (raw.includes('|')) names = raw.split('|').map(s => s.trim()).filter(Boolean);
    else if (raw.includes(',')) names = raw.split(',').map(s => s.trim()).filter(Boolean);
    else names = raw.split(/\s+/).filter(Boolean);

    if (names.length < jumlahTim) return sendMessage(from, `❌ Minimal ${jumlahTim} nama.`);

    const shuffled = shuffle(names);
    const teams = Array.from({ length: jumlahTim }, () => []);
    shuffled.forEach((n, i) => teams[i % jumlahTim].push(n));

    let text = `👥 *HASIL BAGI TIM*\n\n`;
    teams.forEach((team, i) => {
      text += `*Tim ${i + 1} (${team.length} orang):*\n`;
      text += team.map(n => `• ${n}`).join('\n') + '\n\n';
    });

    await sendMessage(from, text.trim());
  },
};
