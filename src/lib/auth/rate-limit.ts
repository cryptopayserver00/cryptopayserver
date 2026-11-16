import type { NextApiRequest, NextApiResponse } from 'next'
import type { ResponseData } from '@/pages/api'

type Bucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

/**
 * Resolve client IP for rate limiting.
 * By default ignore X-Forwarded-For (spoofable). Set TRUST_PROXY=true when
 * sitting behind a trusted reverse proxy that strips/overwrites XFF.
 */
function clientKey(req: NextApiRequest, scope: string): string {
  let ip = req.socket.remoteAddress || 'unknown'

  if (process.env.TRUST_PROXY === 'true' || process.env.TRUST_PROXY === '1') {
    const forwarded = req.headers['x-forwarded-for']
    const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded
    // Right-most hop is typically the proxy-appended client when the proxy appends.
    // Prefer the first hop when the edge proxy replaces XFF with the real client.
    const first = String(raw || '')
      .split(',')[0]
      .trim()
    if (first) ip = first
  }

  return `${scope}:${ip}`
}

/**
 * Simple in-memory rate limiter (per process).
 * Suitable for single-instance self-hosting; multi-instance needs Redis later.
 */
export function rateLimit(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  options: { scope: string; limit: number; windowMs: number }
): boolean {
  const now = Date.now()
  const key = clientKey(req, options.scope)
  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs })
    return true
  }

  if (existing.count >= options.limit) {
    const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000))
    res.setHeader('Retry-After', String(retryAfter))
    res.status(429).json({
      message: 'Too many requests',
      result: false,
      data: null,
    })
    return false
  }

  existing.count += 1
  buckets.set(key, existing)
  return true
}

/** Test helper / periodic cleanup of expired buckets */
export function pruneRateLimitBuckets(now = Date.now()): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

/** Test helper — wipe all buckets */
export function clearRateLimitBuckets(): void {
  buckets.clear()
}
