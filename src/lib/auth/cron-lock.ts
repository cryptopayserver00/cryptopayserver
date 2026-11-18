import { getRedisClient } from '@/lib/redis'

type MemoryLock = { expiresAt: number }

const memoryLocks = new Map<string, MemoryLock>()

function memoryTryAcquire(key: string, ttlMs: number): boolean {
  const now = Date.now()
  const existing = memoryLocks.get(key)
  if (existing && existing.expiresAt > now) return false
  memoryLocks.set(key, { expiresAt: now + ttlMs })
  return true
}

function memoryRelease(key: string): void {
  memoryLocks.delete(key)
}

/**
 * Run a cron job under an exclusive lock.
 * Prefers Redis SET NX PX when REDIS_URL is set; otherwise process-local memory.
 * Returns acquired:false when another worker/tick still holds the lock.
 */
export async function withCronLock<T>(
  name: string,
  ttlMs: number,
  fn: () => Promise<T>
): Promise<{ acquired: false } | { acquired: true; result: T }> {
  const key = `cron:lock:${name}`
  const ttl = Math.max(1_000, Math.floor(ttlMs))
  const redis = await getRedisClient()

  if (redis) {
    const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const ok = await redis.set(key, token, 'PX', ttl, 'NX')
    if (ok !== 'OK') {
      return { acquired: false }
    }
    try {
      const result = await fn()
      return { acquired: true, result }
    } finally {
      try {
        const current = await redis.get(key)
        if (current === token) {
          // Best-effort delete via overwrite with tiny TTL when del is unavailable.
          await redis.set(key, '0', 'PX', 1)
        }
      } catch {
        // lock TTL will expire
      }
    }
  }

  if (!memoryTryAcquire(key, ttl)) {
    return { acquired: false }
  }
  try {
    const result = await fn()
    return { acquired: true, result }
  } finally {
    memoryRelease(key)
  }
}

/** Test helper */
export function resetCronLocksForTests(): void {
  memoryLocks.clear()
}
