import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto'

const PREFIX = 'enc:v1:'

function getEncryptionKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY
  if (!raw || raw.length < 32) {
    throw new Error(
      'ENCRYPTION_KEY must be set to a random string of at least 32 characters'
    )
  }
  // Derive a stable 32-byte key from the env string
  return createHash('sha256').update(raw).digest()
}

/** Encrypt a secret for at-rest storage. Empty values pass through unchanged. */
export function encryptSecret(plaintext: string): string {
  if (!plaintext) return plaintext
  if (plaintext.startsWith(PREFIX)) return plaintext

  const key = getEncryptionKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  return `${PREFIX}${iv.toString('base64url')}:${tag.toString('base64url')}:${encrypted.toString('base64url')}`
}

/**
 * Decrypt a secret. Legacy plaintext (no prefix) is returned as-is so existing
 * rows keep working until rewritten.
 */
export function decryptSecret(value: string): string {
  if (!value) return value
  if (!value.startsWith(PREFIX)) return value

  const body = value.slice(PREFIX.length)
  const [ivB64, tagB64, dataB64] = body.split(':')
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error('Invalid encrypted secret format')
  }

  const key = getEncryptionKey()
  const iv = Buffer.from(ivB64, 'base64url')
  const tag = Buffer.from(tagB64, 'base64url')
  const data = Buffer.from(dataB64, 'base64url')

  const decipher = createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8')
}

export function isEncryptedSecret(value: string): boolean {
  return Boolean(value?.startsWith(PREFIX))
}

/**
 * Decrypt and, if the DB still holds plaintext, return both plaintext and the
 * ciphertext that should be written back (lazy migration).
 */
export function decryptAndUpgrade(value: string): {
  plaintext: string
  upgraded: string | null
} {
  if (!value) return { plaintext: value, upgraded: null }
  if (isEncryptedSecret(value)) {
    return { plaintext: decryptSecret(value), upgraded: null }
  }
  return { plaintext: value, upgraded: encryptSecret(value) }
}
