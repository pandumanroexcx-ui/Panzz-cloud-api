const WORKOUTS = {
  pemula: [
    { nama: 'Jumping Jack', durasi: '30 detik × 3 set', otot: 'Full body' },
    { nama: 'Push Up (dinding)', durasi: '10x × 3 set', otot: 'Dada, bahu' },
    { nama: 'Squat', durasi: '15x × 3 set', otot: 'Kaki, bokong' },
    { nama: 'Plank', durasi: '20 detik × 3 set', otot: 'Core' },
    { nama: 'Lunges', durasi: '10x × 2 set (tiap kaki)', otot: 'Kaki' },
    { nama: 'Crunch', durasi: '15x × 3 set', otot: 'Perut' },
  ],
  menengah: [
    { nama: 'Push Up', durasi: '20x × 4 set', otot: 'Dada, trisep' },
    { nama: 'Burpees', durasi: '10x × 3 set', otot: 'Full body' },
    { nama: 'Mountain Climber', durasi: '30 detik × 4 set', otot: 'Core, cardio' },
    { nama: 'Jump Squat', durasi: '15x × 4 set', otot: 'Kaki, glutes' },
    { nama: 'Russian Twist', durasi: '20x × 3 set', otot: 'Oblique' },
    { nama: 'Bicycle Crunch', durasi: '20x × 3 set', otot: 'Perut' },
  ],
  lanjutan: [
    { nama: 'Pistol Squat', durasi: '8x × 3 set (tiap kaki)', otot: 'Kaki' },
    { nama: 'Diamond Push Up', durasi: '15x × 4 set', otot: 'Trisep' },
    { nama: 'Burpee + Push Up', durasi: '12x × 4 set', otot: 'Full body' },
    { nama: 'Wall Sit', durasi: '60 detik × 3 set', otot: 'Kaki' },
    { nama: 'V-Up', durasi: '15x × 4 set', otot: 'Core' },
    { nama: 'Handstand Push Up (wall)', durasi: '5x × 3 set', otot: 'Bahu' },
  ],
};

module.exports = {
  name: 'workout',
  alias: ['olahraga', 'latihan'],
  category: 'fun',
  description: 'Program workout random',

  async run({ from, args, sendMessage }) {
    const level = (args?.[0] || '').toLowerCase();
    const levels = Object.keys(WORKOUTS);

    let pilih = level;
    if (!WORKOUTS[pilih]) {
      pilih = levels[Math.floor(Math.random() * levels.length)];
    }

    const exercises = [...WORKOUTS[pilih]];
    // Shuffle & ambil 4
    exercises.sort(() => Math.random() - 0.5);
    const picked = exercises.slice(0, 4);

    const list = picked.map((e, i) => `${i + 1}. *${e.nama}*\n   ⏱️ ${e.durasi}\n   💪 ${e.otot}`).join('\n\n');

    await sendMessage(from,
      `💪 *WORKOUT ${pilih.toUpperCase()}*\n\n${list}\n\n` +
      `🔥 *Total: ~15-20 menit*\n\n` +
      `_Pemanasan 3 menit dulu, terus mulai!_`
    );
  },
};
