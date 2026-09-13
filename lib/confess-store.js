const activeUsers = new Map();
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

function recordChat(userId) {
  activeUsers.set(userId, Date.now());
}

function isActive(userId) {
  const lastChat = activeUsers.get(userId);
  if (!lastChat) return false;
  return (Date.now() - lastChat) < TWENTY_FOUR_HOURS;
}

function getLastChat(userId) {
  return activeUsers.get(userId) || null;
}

function getAllActive() {
  const now = Date.now();
  const result = [];
  for (const [userId, timestamp] of activeUsers.entries()) {
    if (now - timestamp < TWENTY_FOUR_HOURS) {
      result.push({ userId, timestamp });
    }
  }
  return result;
}

module.exports = { recordChat, isActive, getLastChat, getAllActive };
