import { describe, expect, it, beforeEach } from 'vitest'
import { clearPasswordResetJtis, consumePasswordResetJti } from '../src/lib/auth/reset-jti'

describe('consumePasswordResetJti', () => {
  beforeEach(() => {
    clearPasswordResetJtis()
    delete process.env.REDIS_URL
  })

  it('allows the first consume and rejects reuse', async () => {
    expect(await consumePasswordResetJti('jti-a', 60)).toBe(true)
    expect(await consumePasswordResetJti('jti-a', 60)).toBe(false)
  })

  it('rejects empty jti', async () => {
    expect(await consumePasswordResetJti('')).toBe(false)
  })
})
