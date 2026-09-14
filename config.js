module.exports = {
  WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN,
  PHONE_NUMBER_ID: process.env.PHONE_NUMBER_ID,
  VERIFY_TOKEN: process.env.VERIFY_TOKEN,

  // Gemini — buat CHAT AI + VISION aja
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_KEY_CHAT: process.env.GEMINI_KEY_CHAT || process.env.GEMINI_API_KEY,

  // Groq — buat fitur FUN/TOOLS (kuis, jokes, ramal, dll)
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  GROQ_KEY_FUN: process.env.GROQ_KEY_FUN || process.env.GROQ_API_KEY,
  GROQ_KEY_TOOLS: process.env.GROQ_KEY_TOOLS || process.env.GROQ_API_KEY,
};
