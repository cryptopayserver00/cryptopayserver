import { createHash, randomBytes, timingSafeEqual } from 'crypto'

const HASH_PREFIX = 'hk:v1:'

/** Generate a high-entropy opaque API key (returned once to the client). */
export function generateApiKey(): string {
  return `cps_${randomBytes(32).toString('base64url')}`
}

export function hashApiKey(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex')
}

/** Persistable value: hashed key + last-4 hint for UI. */
export function sealApiKey(apiKey: string): string {
  const last4 = apiKey.slice(-4)
  return `${HASH_PREFIX}${hashApiKey(apiKey)}:${last4}`
}

export function isHashedApiKey(stored: string): boolean {
  return Boolean(stored?.startsWith(HASH_PREFIX))
}

export function apiKeyHint(stored: string): string {
  if (isHashedApiKey(stored)) {
    const last4 = stored.split(':').pop() || '****'
    return `••••••••${last4}`
  }
  // Legacy plaintext — never echo full key in list APIs.
  if (stored.length <= 4) return '••••'
  return `••••••••${stored.slice(-4)}`
}

/** Constant-time compare of a presented key against a stored sealed/legacy value. */
export function verifyApiKey(presented: string, stored: string): boolean {
  if (!presented || !stored) return false

  if (isHashedApiKey(stored)) {
    const body = stored.slice(HASH_PREFIX.length)
    const [hex] = body.split(':')
    if (!hex || hex.length !== 64) return false
    const presentedHex = hashApiKey(presented)
    try {
      return timingSafeEqual(Buffer.from(hex, 'hex'), Buffer.from(presentedHex, 'hex'))
    } catch {
      return false
    }
  }

  // Legacy plaintext rows
  const a = Buffer.from(presented)
  const b = Buffer.from(stored)
  if (a.length !== b.length) return false
  try {
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}
