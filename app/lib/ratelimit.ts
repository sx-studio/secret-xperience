// Lightweight in-memory rate limiter (per Vercel function instance).
// Not shared across instances but provides meaningful protection against
// burst attacks from a single IP within the same warm instance.

interface Window { count: number; reset: number }
const store = new Map<string, Window>()

export function rateLimit(
  ip: string,
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; reset: number } {
  const now   = Date.now()
  const id    = `${key}:${ip}`
  const entry = store.get(id)

  if (!entry || now > entry.reset) {
    store.set(id, { count: 1, reset: now + windowMs })
    return { allowed: true, remaining: limit - 1, reset: now + windowMs }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, reset: entry.reset }
  }

  entry.count++
  return { allowed: true, remaining: limit - entry.count, reset: entry.reset }
}

// Periodically prune expired entries to prevent memory leak
setInterval(() => {
  const now = Date.now()
  for (const [k, v] of store) {
    if (now > v.reset) store.delete(k)
  }
}, 60_000)
