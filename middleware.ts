import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import {
  API_KEY_API_PATHS,
  CRON_HEADER_NAME,
  PUBLIC_API_PATHS,
  SCHEDULE_API_PREFIX,
  SESSION_COOKIE_NAME,
} from '@/lib/auth/constants'

function getSessionSecret(): Uint8Array | null {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) return null
  return new TextEncoder().encode(secret)
}

async function hasValidSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
  if (!token) return false

  const secret = getSessionSecret()
  if (!secret) return false

  try {
    const { payload } = await jwtVerify(token, secret)
    // Edge gate: only full session JWTs (not pending_2fa / password_reset).
    if (payload.typ && payload.typ !== 'session') return false
    const userId = Number(payload.userId ?? payload.sub)
    if (!Number.isFinite(userId) || userId <= 0) return false
    if (typeof payload.pwdv !== 'string' || !payload.pwdv) return false
    return true
  } catch {
    return false
  }
}

function timingSafeEqualString(a: string, b: string): boolean {
  const enc = new TextEncoder()
  const bufA = enc.encode(a)
  const bufB = enc.encode(b)
  if (bufA.byteLength !== bufB.byteLength) return false
  // Constant-time compare (Edge-compatible; no node:crypto required).
  let diff = 0
  for (let i = 0; i < bufA.byteLength; i++) {
    diff |= bufA[i]! ^ bufB[i]!
  }
  return diff === 0
}

function hasValidCronSecret(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET
  if (!expected || expected.length < 16) return false
  const provided = req.headers.get(CRON_HEADER_NAME)
  if (!provided) return false
  return timingSafeEqualString(provided, expected)
}

function hasApiKeyHeader(req: NextRequest): boolean {
  const apiKey = req.headers.get('x-api-key')
  return Boolean(apiKey && apiKey.trim())
}

function generateNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return btoa(binary)
}

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    // Nonce + strict-dynamic: Next.js scripts carry the nonce; follow-on loads allowed.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    // Styles still need unsafe-inline for Tailwind / CSS-in-JS until hashed.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https: wss:",
    "object-src 'none'",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
}

function withPageSecurityHeaders(req: NextRequest): NextResponse {
  const nonce = generateNonce()
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-nonce', nonce)

  const res = NextResponse.next({
    request: { headers: requestHeaders },
  })
  res.headers.set('Content-Security-Policy', buildCsp(nonce))
  res.headers.set('x-nonce', nonce)
  return res
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // HTML / app routes — attach CSP nonce (skip static asset-looking paths).
  if (!pathname.startsWith('/api/')) {
    if (
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/uploads/') ||
      pathname.includes('.')
    ) {
      return NextResponse.next()
    }
    return withPageSecurityHeaders(req)
  }

  // Liveness probe — no auth
  if (pathname === '/api/health') {
    return NextResponse.next()
  }

  // Internal cron jobs authenticate via shared secret, not session cookie
  if (pathname.startsWith(SCHEDULE_API_PREFIX)) {
    if (!hasValidCronSecret(req)) {
      return NextResponse.json(
        { message: 'Unauthorized', result: false, data: null },
        { status: 401 }
      )
    }
    return NextResponse.next()
  }

  if (PUBLIC_API_PATHS.has(pathname)) {
    return NextResponse.next()
  }

  // Only allow API-key clients past the edge gate on explicitly allowlisted routes.
  if (hasApiKeyHeader(req) && API_KEY_API_PATHS.has(pathname)) {
    return NextResponse.next()
  }

  if (!(await hasValidSession(req))) {
    return NextResponse.json(
      { message: 'Unauthorized', result: false, data: null },
      { status: 401 }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|uploads/).*)',
  ],
}
