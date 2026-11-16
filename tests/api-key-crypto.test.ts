import { describe, expect, it } from 'vitest'
import {
  apiKeyHint,
  generateApiKey,
  isHashedApiKey,
  sealApiKey,
  verifyApiKey,
} from '../src/lib/auth/api-key-crypto'

describe('api-key-crypto', () => {
  it('seals and verifies a generated key', () => {
    const key = generateApiKey()
    const sealed = sealApiKey(key)
    expect(isHashedApiKey(sealed)).toBe(true)
    expect(verifyApiKey(key, sealed)).toBe(true)
    expect(verifyApiKey('wrong', sealed)).toBe(false)
    expect(apiKeyHint(sealed)).toContain(key.slice(-4))
  })

  it('still verifies legacy plaintext rows', () => {
    const legacy = 'legacy-plain-key-1234'
    expect(verifyApiKey(legacy, legacy)).toBe(true)
    expect(apiKeyHint(legacy)).toBe('••••••••1234')
  })
})
