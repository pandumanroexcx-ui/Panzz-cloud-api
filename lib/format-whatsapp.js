function markdownToWhatsApp(text) {
  let result = text;

  // **tebal** atau __tebal__ -> *tebal* (format bold WhatsApp)
  result = result.replace(/\*\*(.+?)\*\*/g, '*$1*');
  result = result.replace(/__(.+?)__/g, '*$1*');

  // ~~coret~~ -> ~coret~ (format strikethrough WhatsApp)
  result = result.replace(/~~(.+?)~~/g, '~$1~');

  // Heading markdown (# Judul, ## Judul) -> *Judul* (biar keliatan tebal doang)
  result = result.replace(/^#{1,6}\s*(.+)$/gm, '*$1*');

  // Bullet list markdown (- item, * item) -> • item
  result = result.replace(/^[\*\-]\s+(.+)$/gm, '• $1');

  return result;
}

module.exports = { markdownToWhatsApp };
