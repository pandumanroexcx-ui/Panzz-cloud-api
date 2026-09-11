const pending = new Map();

function setPending(from, data) {
  pending.set(from, { ...data, timestamp: Date.now() });
}

function getPending(from) {
  return pending.get(from);
}

function clearPending(from) {
  pending.delete(from);
}

module.exports = { setPending, getPending, clearPending };
