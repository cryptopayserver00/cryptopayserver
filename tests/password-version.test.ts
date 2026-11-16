import { describe, expect, it } from 'vitest'
import { passwordVersion } from '../src/lib/auth/session'

describe('passwordVersion', () => {
  it('changes when the password hash changes', () => {
    const a = passwordVersion('$2a$12$abcdef')
    const b = passwordVersion('$2a$12$abcdefg')
    expect(a).not.toBe(b)
    expect(a).toHaveLength(16)
  })

  it('is stable for the same hash', () => {
    expect(passwordVersion('same')).toBe(passwordVersion('same'))
  })
})
