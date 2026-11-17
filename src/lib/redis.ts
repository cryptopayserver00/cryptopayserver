type RedisClient = {
  incr(key: string): Promise<number>
  pexpire(key: string, ms: number): Promise<number>
  pttl(key: string): Promise<number>
  set(key: string, value: string, ...args: Array<string | number>): Promise<string | null>
  get(key: string): Promise<string | null>
}

let redisClient: RedisClient | null | undefined
let warnedNoRedisInProduction = false

/** Shared optional Redis client when REDIS_URL is set. */
export async function getRedisClient(): Promise<RedisClient | null> {
  if (redisClient !== undefined) return redisClient
  const url = (process.env.REDIS_URL || '').trim()
  if (!url) {
    if (
      !warnedNoRedisInProduction &&
      process.env.NODE_ENV === 'production'
    ) {
      warnedNoRedisInProduction = true
      console.warn(
        '[redis] REDIS_URL unset — rate limits use in-memory buckets (not shared across instances)'
      )
    }
    redisClient = null
    return null
  }
  try {
    const { default: Redis } = await import('ioredis')
    const client = new Redis(url, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
      lazyConnect: false,
      connectTimeout: 2000,
    })
    client.on('error', (err: Error) => {
      console.error('[redis] error:', err.message)
    })
    redisClient = client as unknown as RedisClient
    return redisClient
  } catch (e) {
    console.error('[redis] unavailable, falling back to memory:', e)
    redisClient = null
    return null
  }
}

/** Test helper — force next getRedisClient() to re-resolve. */
export function resetRedisClientForTests(): void {
  redisClient = undefined
}
