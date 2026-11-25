/**
 * Limiteur de débit simple en mémoire (fenêtre fixe).
 * Limite : la mémoire est propre à chaque instance du serveur. Sur Vercel (plusieurs
 * instances), c'est une protection partielle ; pour une limite stricte, brancher
 * Upstash Redis / Vercel KV ici.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
let lastSweep = Date.now();

export function hitRateLimit(key: string, limit: number, windowMs: number): { limited: boolean; retryAfter: number } {
  const now = Date.now();
  if (now - lastSweep > 60_000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
    lastSweep = now;
  }
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, retryAfter: 0 };
  }
  bucket.count += 1;
  return { limited: bucket.count > limit, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
}
