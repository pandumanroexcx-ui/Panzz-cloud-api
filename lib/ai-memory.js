// Simpen history chat per user (in-memory)
// Key: nomor WhatsApp, Value: array { role, content }
const histories = new Map();
const MAX_HISTORY = 20; // simpen 20 pesan terakhir (10 user + 10 bot)

function getHistory(userId) {
  return histories.get(userId) || [];
}

function addMessage(userId, role, content) {
  const hist = histories.get(userId) || [];
  hist.push({ role, content });
  if (hist.length > MAX_HISTORY) {
    hist.splice(0, hist.length - MAX_HISTORY);
  }
  histories.set(userId, hist);
}

function clearHistory(userId) {
  histories.delete(userId);
}

module.exports = { getHistory, addMessage, clearHistory };
