import { describe, expect, it, beforeAll } from 'vitest'
import { createHmac } from 'crypto'
import { signPublicResource, verifyPublicResource } from '@/lib/security/public-token'

describe('public-token', () => {
  beforeAll(() => {
    process.env.SESSION_SECRET = 'test-session-secret-at-least-32-chars!!'
  })

  it('signs and verifies a pull payment token with expiry', () => {
    const id = 123456789012345
    const token = signPublicResource('pull_payment', id)
    expect(token.includes('.')).toBe(true)
    expect(verifyPublicResource('pull_payment', id, token)).toBe(true)
    expect(verifyPublicResource('pull_payment', id + 1, token)).toBe(false)
    expect(verifyPublicResource('payment_request', id, token)).toBe(false)
  })

  it('rejects expired tokens', () => {
    const id = 42
    const exp = Math.floor(Date.now() / 1000) - 10
    const sig = createHmac('sha256', process.env.SESSION_SECRET as string)
      .update(`invoice:${id}:${exp}`)
      .digest('base64url')
    expect(verifyPublicResource('invoice', id, `${exp}.${sig}`)).toBe(false)
  })

  it('rejects legacy permanent tokens', () => {
    const id = 99
    const legacy = createHmac('sha256', process.env.SESSION_SECRET as string)
      .update(`invoice:${id}`)
      .digest('base64url')
    expect(verifyPublicResource('invoice', id, legacy)).toBe(false)
  })
})
