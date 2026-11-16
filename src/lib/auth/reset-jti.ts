import { getRedisClient } from '@/lib/redis'
import { PASSWORD_RESET_MAX_AGE_SECONDS } from './constants'

const usedJtis = new Map<string, number>()

function pruneMemory(now = Date.now()): void {
  for (const [jti, exp] of usedJtis) {
    if (exp <= now) usedJtis.delete(jti)
  }
}

/**
 * Mark a password-reset jti as consumed (one-time use).
 * Returns false if the jti was already used.
 */
export async function consumePasswordResetJti(
  jti: string,
  ttlSeconds = PASSWORD_RESET_MAX_AGE_SECONDS
): Promise<boolean> {
  const id = String(jti || '').trim()
  if (!id) return false

  const redis = await getRedisClient()
  if (redis) {
    try {
      // SET NX + EX — succeeds only the first time.
      const result = await redis.set(`pwdreset:jti:${id}`, '1', 'EX', ttlSeconds, 'NX')
      return result === 'OK'
    } catch (e) {
      console.error('[reset-jti] Redis error, falling back to memory:', e)
    }
  }

  pruneMemory()
  const now = Date.now()
  if (usedJtis.has(id)) return false
  usedJtis.set(id, now + ttlSeconds * 1000)
  return true
}

/** Test helper */
export function clearPasswordResetJtis(): void {
  usedJtis.clear()
}
