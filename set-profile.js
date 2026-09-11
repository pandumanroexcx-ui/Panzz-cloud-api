const fs = require('fs');
const path = require('path');
const { WHATSAPP_TOKEN, PHONE_NUMBER_ID } = require('./config');

async function updateProfile() {
  try {
    const imagePath = path.resolve('./assets/Anime.jpeg');
    if (!fs.existsSync(imagePath)) {
      console.error('❌ File assets/Anime.jpeg tidak ditemukan! Pastikan sudah di-cp.');
      return;
    }

    console.log('1. Mengunggah gambar ke WhatsApp Media...');
    const fileBuffer = fs.readFileSync(imagePath);
    const formMedia = new FormData();
    formMedia.append('messaging_product', 'whatsapp');
    formMedia.append('file', new Blob([fileBuffer], { type: 'image/jpeg' }), 'Anime.jpeg');

    const resMedia = await fetch(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/media`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` },
      body: formMedia,
    });
    
    const mediaData = await resMedia.json();
    if (mediaData.error) {
      console.error('❌ Gagal upload media:', mediaData.error.message);
      return;
    }

    console.log('2. Mengubah foto profil...');
    const resProfile = await fetch(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/whatsapp_business_profile`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        profile_picture_handle: mediaData.id,
      }),
    });

    const profileData = await resProfile.json();
    if (profileData.error) {
      console.error('❌ Gagal update profil:', profileData.error.message);
    } else {
      console.log('✅ Berhasil memperbarui foto profil WhatsApp!', profileData);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

updateProfile();
