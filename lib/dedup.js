const processedIds = new Set();
const MAX_SIZE = 500;

function isDuplicate(messageId) {
  if (processedIds.has(messageId)) return true;
  processedIds.add(messageId);
  if (processedIds.size > MAX_SIZE) {
    const first = processedIds.values().next().value;
    processedIds.delete(first);
  }
  return false;
}

module.exports = { isDuplicate };
