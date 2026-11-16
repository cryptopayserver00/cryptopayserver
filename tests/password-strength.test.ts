import { describe, expect, it } from 'vitest'
import { validatePasswordStrength } from '../src/lib/auth/password'

describe('validatePasswordStrength', () => {
  it('rejects short or letter-only passwords', () => {
    expect(validatePasswordStrength('abc')).toBeTruthy()
    expect(validatePasswordStrength('abcdefgh')).toBeTruthy()
    expect(validatePasswordStrength('12345678')).toBeTruthy()
  })

  it('accepts mixed alphanumeric passwords', () => {
    expect(validatePasswordStrength('abc12345')).toBeNull()
  })
})
