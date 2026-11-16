import type { NextApiRequest, NextApiResponse } from 'next'
import type { ResponseData } from '@/pages/api'

function allowedOrigins(): Set<string> {
  const set = new Set<string>()
  for (const raw of [
    process.env.APP_BASE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    ...(process.env.CORS_ORIGIN || '').split(','),
  ]) {
    const value = String(raw || '').trim()
    if (!value) continue
    try {
      set.add(new URL(value).origin)
    } catch {
      // ignore invalid
    }
  }
  return set
}

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Reject cross-site mutating requests that carry a browser Origin/Referer
 * outside APP_BASE_URL / CORS_ORIGIN.
 * In production, missing Origin allowlist fails closed.
 * When Origin/Referer are absent, require a non-simple header typical of our SPA.
 */
export function assertSameOrigin(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
): boolean {
  const method = String(req.method || 'GET').toUpperCase()
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return true
  }

  const allowed = allowedOrigins()
  if (allowed.size === 0) {
    if (isProduction()) {
      res.status(403).json({
        message: 'APP_BASE_URL or CORS_ORIGIN must be configured',
        result: false,
        data: null,
      })
      return false
    }
    return true
  }

  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : ''
  if (origin) {
    if (!allowed.has(origin)) {
      res.status(403).json({ message: 'Invalid origin', result: false, data: null })
      return false
    }
    return true
  }

  const referer = typeof req.headers.referer === 'string' ? req.headers.referer : ''
  if (referer) {
    try {
      if (!allowed.has(new URL(referer).origin)) {
        res.status(403).json({ message: 'Invalid referer', result: false, data: null })
        return false
      }
      return true
    } catch {
      res.status(403).json({ message: 'Invalid referer', result: false, data: null })
      return false
    }
  }

  // Cookie-session mutations must carry Origin or Referer.
  // Do not trust Content-Type alone — browsers can send JSON cross-site with cookies
  // when SameSite is Lax/None and the request is not a top-level navigation.
  res.status(403).json({ message: 'Missing origin', result: false, data: null })
  return false
}
