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

function hasValidCronSecret(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET
  if (!expected || expected.length < 16) return false
  const provided = req.headers.get(CRON_HEADER_NAME)
  return Boolean(provided && provided === expected)
}

function hasApiKeyHeader(req: NextRequest): boolean {
  const apiKey = req.headers.get('x-api-key')
  return Boolean(apiKey && apiKey.trim())
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!pathname.startsWith('/api/')) {
    return NextResponse.next()
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
  matcher: ['/api/:path*'],
}
