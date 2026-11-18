import { describe, expect, it, beforeEach } from 'vitest'
import { resetCronLocksForTests, withCronLock } from '../src/lib/auth/cron-lock'
import { resetRedisClientForTests } from '../src/lib/redis'

describe('withCronLock', () => {
  beforeEach(() => {
    resetCronLocksForTests()
    resetRedisClientForTests()
    delete process.env.REDIS_URL
  })

  it('runs the job when lock is free', async () => {
    const locked = await withCronLock('test-job', 5_000, async () => 42)
    expect(locked.acquired).toBe(true)
    if (locked.acquired) expect(locked.result).toBe(42)
  })

  it('skips when lock is held', async () => {
    let release!: () => void
    const hold = new Promise<void>((resolve) => {
      release = resolve
    })

    const first = withCronLock('held-job', 30_000, async () => {
      await hold
      return 'done'
    })

    // Allow first task to acquire
    await new Promise((r) => setTimeout(r, 10))
    const second = await withCronLock('held-job', 30_000, async () => 'nope')
    expect(second.acquired).toBe(false)

    release()
    const finished = await first
    expect(finished.acquired).toBe(true)
  })
})
