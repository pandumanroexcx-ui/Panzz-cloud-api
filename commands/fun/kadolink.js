const { uploadDocument } = require('../../lib/whatsapp-media');
const { sendDocument } = require('../../lib/send-message');

function generateGiftHTML(pesan, judul = 'Untuk Kamu 💌') {
  // Escape pesan biar aman
  const safePesan = String(pesan)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${judul}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    color: #fff;
    padding: 20px;
  }
  .container {
    text-align: center;
    max-width: 500px;
    width: 100%;
    animation: fadeIn 0.8s ease;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes bounce {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-15px) rotate(5deg); }
  }
  @keyframes shake {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-10deg); }
    75% { transform: rotate(10deg); }
  }
  @keyframes glow {
    0%, 100% { text-shadow: 0 0 10px rgba(255,107,157,0.5); }
    50% { text-shadow: 0 0 30px rgba(255,107,157,1), 0 0 50px rgba(255,107,157,0.8); }
  }
  .gift-box {
    font-size: 120px;
    cursor: pointer;
    display: inline-block;
    animation: bounce 1.5s infinite;
    user-select: none;
    filter: drop-shadow(0 10px 20px rgba(255,107,157,0.4));
    transition: transform 0.3s;
  }
  .gift-box:hover { transform: scale(1.1); }
  .gift-box:active { animation: shake 0.5s; }
  .hint {
    margin-top: 30px;
    font-size: 18px;
    opacity: 0.85;
    letter-spacing: 1px;
    animation: fadeIn 1s ease 0.5s both;
  }
  .pesan {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 107, 157, 0.3);
    border-radius: 20px;
    padding: 30px 25px;
    font-size: 20px;
    line-height: 1.6;
    margin: 20px 0;
    animation: fadeIn 1s ease;
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
  }
  .pesan-emoji {
    font-size: 40px;
    margin-bottom: 15px;
    animation: glow 2s infinite;
  }
  .btn {
    display: block;
    width: 100%;
    padding: 16px 20px;
    margin: 12px 0;
    border: none;
    border-radius: 15px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    font-family: inherit;
    color: #fff;
  }
  .btn-1 {
    background: linear-gradient(135deg, #ff6b9d 0%, #ff4757 100%);
    box-shadow: 0 5px 20px rgba(255,107,157,0.4);
  }
  .btn-2 {
    background: linear-gradient(135deg, #4a90e2 0%, #5f27cd 100%);
    box-shadow: 0 5px 20px rgba(74,144,226,0.4);
  }
  .btn-3 {
    background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
    box-shadow: 0 5px 20px rgba(108,117,125,0.4);
  }
  .btn:hover {
    transform: translateY(-3px);
    filter: brightness(1.1);
  }
  .btn:active { transform: translateY(0); }
  .feedback {
    margin-top: 20px;
    padding: 20px;
    border-radius: 15px;
    background: rgba(255, 255, 255, 0.1);
    display: none;
    animation: fadeIn 0.5s ease;
  }
  .feedback.show { display: block; }
  .hidden { display: none !important; }
  .heart {
    position: fixed;
    color: #ff6b9d;
    font-size: 20px;
    pointer-events: none;
    animation: floatUp 3s ease-out forwards;
  }
  @keyframes floatUp {
    0% { transform: translateY(0) scale(1); opacity: 1; }
    100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
  }
</style>
</head>
<body>

<div class="container" id="stage1">
  <div class="gift-box" onclick="openStage2()">🎁</div>
  <div class="hint">✦ Klik kadonya ✦</div>
</div>

<div class="container hidden" id="stage2">
  <div style="font-size: 80px;">💌</div>
  <div class="hint" style="font-size: 22px; margin-top: 20px;">Hai...</div>
  <div class="hint" style="font-size: 16px; margin-top: 10px;">Ada sesuatu buat kamu</div>
  <button class="btn btn-1" style="margin-top: 30px;" onclick="openStage3()">Buka Pesan 💝</button>
</div>

<div class="container hidden" id="stage3">
  <div class="pesan">
    <div class="pesan-emoji">💝</div>
    ${safePesan}
  </div>
  <div class="hint" style="font-size: 14px; margin-bottom: 15px;">Pilih jawabanmu:</div>
  <button class="btn btn-1" onclick="pilih('Aku juga suka kamu! 💕')">💕 Aku juga suka kamu</button>
  <button class="btn btn-2" onclick="pilih('Kita temenan aja ya 😊')">🤝 Temenan aja ya</button>
  <button class="btn btn-3" onclick="pilih('Maaf... aku belum siap 🙏')">🙏 Maaf, belum siap</button>
  <div class="feedback" id="feedback"></div>
</div>

<script>
  function openStage2() {
    document.getElementById('stage1').classList.add('hidden');
    document.getElementById('stage2').classList.remove('hidden');
    burstHearts(10);
  }

  function openStage3() {
    document.getElementById('stage2').classList.add('hidden');
    document.getElementById('stage3').classList.remove('hidden');
    burstHearts(20);
  }

  function pilih(jawaban) {
    burstHearts(30);
    const fb = document.getElementById('feedback');
    fb.classList.add('show');
    fb.innerHTML = '<div style="font-size: 40px; margin-bottom: 10px;">✨</div><strong>' + jawaban + '</strong><br><br><span style="opacity: 0.7; font-size: 14px;">Jawaban kamu udah tersimpan di hatimu 💖</span>';
    // Disable buttons
    document.querySelectorAll('.btn').forEach(b => { b.disabled = true; b.style.opacity = 0.5; });
  }

  function burstHearts(count) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.textContent = ['❤️','💕','💖','💗','💝','💘'][Math.floor(Math.random()*6)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.bottom = '0';
        heart.style.fontSize = (15 + Math.random() * 20) + 'px';
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 3000);
      }, i * 80);
    }
  }
</script>
</body>
</html>`;
}

module.exports = {
  name: 'kadolink',
  alias: ['kadounik', 'kadoviral', 'surat'],
  category: 'fun',
  description: 'Bikin link/file kado rahasia interaktif buat dikirim ke seseorang',

  async run({ from, message, sendMessage }) {
    const raw = (message?.text?.body || '')
      .replace(/^\.?(kadolink|kadounik|kadoviral|surat)\s+/i, '')
      .trim();

    if (!raw || raw === 'help') {
      return sendMessage(from,
        '🎁 *KADO RAHASIA*\n\n' +
        '*Format:* `kadolink <pesan rahasia>`\n\n' +
        '*Contoh:*\n' +
        '`kadolink Aku udah suka kamu dari lama...`\n\n' +
        '*Hasil:*\n' +
        '📄 File HTML interaktif yang bisa kamu share ke orang.\n\n' +
        '*Cara pakai:*\n' +
        '1. Bot kirim file `.html`\n' +
        '2. Download file-nya\n' +
        '3. Share ke orang yang dituju via WA/IG/dll\n' +
        '4. Dia buka file-nya → klik kado 🎁 → muncul pesan rahasia kamu\n' +
        '5. Dia pilih 1 dari 3 jawaban\n\n' +
        '_⚠️ Jawaban dia cuma keliatan di HP dia sendiri (gak kirim ke kamu)_'
      );
    }

    if (raw.length > 500) return sendMessage(from, '❌ Max 500 karakter.');

    await sendMessage(from, '🎁 Lagi bikin kado rahasia...');

    try {
      const html = generateGiftHTML(raw);
      const buffer = Buffer.from(html, 'utf8');

      const filename = `kado-rahasia-${Date.now()}.html`;
      const mediaId = await uploadDocument(buffer, filename);

      await sendDocument(from, mediaId, filename,
        `🎁 *KADO RAHASIA SIAP!*\n\n` +
        `📄 File HTML interaktif udah dikirim.\n\n` +
        `*Cara pakai:*\n` +
        `1. Download file di atas\n` +
        `2. Share ke orang yang kamu tuju\n` +
        `3. Dia buka file → klik kado 🎁 → ada pesan rahasia\n\n` +
        `💡 *Tips:* Kirim file-nya lewat WA ke dia!`
      );
    } catch (e) {
      console.error('[KADOLINK]', e.message);
      await sendMessage(from, `⚠️ Gagal: ${e.message}`);
    }
  },
};
