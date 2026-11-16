import bcrypt from 'bcryptjs'
import CryptoJS from 'crypto-js'

const BCRYPT_ROUNDS = 12

/** Return an error message when the password is too weak; otherwise null. */
export function validatePasswordStrength(password: string): string | null {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters'
  }
  if (password.length > 128) {
    return 'Password must be at most 128 characters'
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must include letters and numbers'
  }
  return null
}

/** Hash a password with bcrypt. Prefer this for all new writes. */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

/**
 * Verify a password against a stored hash.
 * Supports legacy SHA256 hex hashes so existing users can still log in;
 * callers should re-hash with bcrypt after a successful legacy match.
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<{ ok: boolean; needsRehash: boolean }> {
  if (!storedHash) {
    return { ok: false, needsRehash: false }
  }

  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$') || storedHash.startsWith('$2y$')) {
    const ok = await bcrypt.compare(password, storedHash)
    return { ok, needsRehash: false }
  }

  // Legacy: unsalted SHA256 hex
  const legacy = CryptoJS.SHA256(password).toString()
  if (legacy === storedHash) {
    return { ok: true, needsRehash: true }
  }

  return { ok: false, needsRehash: false }
}
