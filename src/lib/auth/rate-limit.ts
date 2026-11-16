import type { NextApiRequest, NextApiResponse } from 'next'
import type { ResponseData } from '@/pages/api'
import { getRedisClient } from '@/lib/redis'

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
    const first = String(raw || '')
      .split(',')[0]
      .trim()
    if (first) ip = first
  }

  return `${scope}:${ip}`
}

function rejectTooMany(
  res: NextApiResponse<ResponseData>,
  retryAfterSec: number
): false {
  res.setHeader('Retry-After', String(Math.max(1, retryAfterSec)))
  res.status(429).json({
    message: 'Too many requests',
    result: false,
    data: null,
  })
  return false
}

function rateLimitMemory(
  key: string,
  res: NextApiResponse<ResponseData>,
  options: { limit: number; windowMs: number }
): boolean {
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs })
    return true
  }

  if (existing.count >= options.limit) {
    return rejectTooMany(res, Math.ceil((existing.resetAt - now) / 1000))
  }

  existing.count += 1
  buckets.set(key, existing)
  return true
}

/**
 * Rate limiter. Uses Redis when REDIS_URL is set (multi-instance safe),
 * otherwise in-process memory (single-instance).
 */
export async function rateLimit(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  options: { scope: string; limit: number; windowMs: number }
): Promise<boolean> {
  const key = clientKey(req, options.scope)
  const redis = await getRedisClient()
  if (redis) {
    const redisKey = `rl:${key}`
    try {
      const count = await redis.incr(redisKey)
      if (count === 1) {
        await redis.pexpire(redisKey, options.windowMs)
      }
      if (count > options.limit) {
        const ttl = await redis.pttl(redisKey)
        const retryAfter = ttl > 0 ? Math.ceil(ttl / 1000) : Math.ceil(options.windowMs / 1000)
        return rejectTooMany(res, retryAfter)
      }
      return true
    } catch (e) {
      console.error('[rate-limit] Redis error, falling back to memory:', e)
      return rateLimitMemory(key, res, options)
    }
  }
  return rateLimitMemory(key, res, options)
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
