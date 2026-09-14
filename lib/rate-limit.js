const buckets = new Map();
const MAX_PER_MINUTE = 20;
const WINDOW_MS = 60 * 1000;

function checkRateLimit(userId) {
  const now = Date.now();
  const bucket = buckets.get(userId) || { count: 0, resetAt: now + WINDOW_MS };
  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + WINDOW_MS;
  }
  bucket.count++;
  buckets.set(userId, bucket);
  if (bucket.count > MAX_PER_MINUTE) return { allowed: false, remaining: 0 };
  return { allowed: true, remaining: MAX_PER_MINUTE - bucket.count };
}

function cleanup() {
  const now = Date.now();
  for (const [userId, bucket] of buckets.entries()) {
    if (now > bucket.resetAt + 60000) buckets.delete(userId);
  }
}
setInterval(cleanup, 5 * 60 * 1000);

module.exports = { checkRateLimit };
