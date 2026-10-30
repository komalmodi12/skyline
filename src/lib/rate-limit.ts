const WINDOW_MS = 10 * 60 * 1000; // 10 minute
const MAX_HITS = 5;

const hits = new Map<string, number[]>();

function recent(ip: string, now: number) {
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (list.length) hits.set(ip, list);
  else hits.delete(ip);
  return list;
}

export function checkRateLimit(ip: string, now = Date.now()) {
  const list = recent(ip, now);
  if (list.length >= MAX_HITS) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((list[0] + WINDOW_MS - now) / 1000)
    );
    return { allowed: false, retryAfterSeconds };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

export function recordHit(ip: string, now = Date.now()) {
  const list = recent(ip, now);
  list.push(now);
  hits.set(ip, list);
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}