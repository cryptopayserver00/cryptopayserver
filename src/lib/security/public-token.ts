import { createHmac, timingSafeEqual } from 'crypto'

export type PublicResourceKind = 'pull_payment' | 'payment_request' | 'invoice'

/** Default share-link lifetime: 90 days. */
export const PUBLIC_TOKEN_TTL_SECONDS = 90 * 24 * 60 * 60

function getSigningSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.ENCRYPTION_KEY
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET or ENCRYPTION_KEY must be set (≥32 chars) for public tokens')
  }
  return secret
}

function hmac(payload: string): string {
  return createHmac('sha256', getSigningSecret()).update(payload).digest('base64url')
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

/**
 * Opaque HMAC token bound to a public resource id.
 * Format: `{exp}.{sig}` where sig = HMAC(`${kind}:${id}:${exp}`).
 */
export function signPublicResource(
  kind: PublicResourceKind,
  id: string | number | bigint,
  ttlSeconds: number = PUBLIC_TOKEN_TTL_SECONDS
): string {
  const exp = Math.floor(Date.now() / 1000) + Math.max(60, ttlSeconds)
  const sig = hmac(`${kind}:${String(id)}:${exp}`)
  return `${exp}.${sig}`
}

export function verifyPublicResource(
  kind: PublicResourceKind,
  id: string | number | bigint,
  token: unknown
): boolean {
  const provided = String(token || '')
  if (!provided) return false

  // New format: exp.sig
  const dot = provided.indexOf('.')
  if (dot > 0) {
    const expStr = provided.slice(0, dot)
    const sig = provided.slice(dot + 1)
    const exp = Number(expStr)
    if (!Number.isFinite(exp) || exp <= 0) return false
    if (exp < Math.floor(Date.now() / 1000)) return false
    const expected = hmac(`${kind}:${String(id)}:${exp}`)
    return safeEqual(expected, sig)
  }

  // Legacy permanent tokens (no exp) are rejected — re-issue share links.
  return false
}

export function readAccessToken(req: {
  query?: Record<string, unknown>
  body?: Record<string, unknown>
}): string {
  const q = req.query || {}
  const b = req.body || {}
  return String(
    b.access_token ||
      b.token ||
      q.access_token ||
      q.token ||
      q.t ||
      ''
  ).trim()
}
