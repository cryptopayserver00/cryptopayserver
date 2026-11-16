import { createHash, randomBytes } from 'crypto'
import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import {
  PENDING_2FA_COOKIE_NAME,
  PENDING_2FA_MAX_AGE_SECONDS,
  PASSWORD_RESET_MAX_AGE_SECONDS,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from './constants'
import { consumePasswordResetJti } from './reset-jti'

export type SessionPayload = {
  userId: number
}

/** Stable fingerprint of the password hash — changes when the password changes. */
export function passwordVersion(passwordHash: string): string {
  return createHash('sha256').update(passwordHash || '').digest('hex').slice(0, 16)
}

function getSessionSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error(
      'SESSION_SECRET must be set to a random string of at least 32 characters'
    )
  }
  return new TextEncoder().encode(secret)
}

export async function createSessionToken(
  userId: number,
  passwordHash: string
): Promise<string> {
  return new SignJWT({
    userId,
    typ: 'session',
    pwdv: passwordVersion(passwordHash),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSessionSecret())
}

export async function createPending2faToken(userId: number): Promise<string> {
  return new SignJWT({ userId, typ: 'pending_2fa' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(`${PENDING_2FA_MAX_AGE_SECONDS}s`)
    .sign(getSessionSecret())
}

export async function createPasswordResetToken(
  userId: number,
  email: string,
  passwordHash: string
): Promise<string> {
  const jti = randomBytes(16).toString('hex')
  return new SignJWT({
    userId,
    email,
    typ: 'password_reset',
    // Bind to current password so a successful reset invalidates the token.
    pwdv: passwordVersion(passwordHash),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(jti)
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(`${PASSWORD_RESET_MAX_AGE_SECONDS}s`)
    .sign(getSessionSecret())
}

export async function verifySessionToken(
  token: string
): Promise<{ userId: number; pwdv: string | null } | null> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecret())
    if (payload.typ && payload.typ !== 'session') return null
    const userId = Number(payload.userId ?? payload.sub)
    if (!Number.isFinite(userId) || userId <= 0) return null
    const pwdv = typeof payload.pwdv === 'string' ? payload.pwdv : null
    return { userId, pwdv }
  } catch {
    return null
  }
}

export async function verifyPending2faToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecret())
    if (payload.typ !== 'pending_2fa') return null
    return payloadToSession(payload)
  } catch {
    return null
  }
}

export async function verifyPasswordResetToken(
  token: string
): Promise<{ userId: number; email: string; pwdv: string | null; jti: string | null } | null> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecret())
    if (payload.typ !== 'password_reset') return null
    const userId = Number(payload.userId ?? payload.sub)
    const email = String(payload.email || '')
    if (!Number.isFinite(userId) || userId <= 0 || !email) return null
    const pwdv = typeof payload.pwdv === 'string' ? payload.pwdv : null
    const jti = typeof payload.jti === 'string' ? payload.jti : null
    return { userId, email, pwdv, jti }
  } catch {
    return null
  }
}

/** Consume reset jti after pwdv checks pass — makes the token one-time. */
export async function consumePasswordResetTokenJti(jti: string | null): Promise<boolean> {
  if (!jti) return false
  return consumePasswordResetJti(jti)
}

function payloadToSession(payload: JWTPayload): SessionPayload | null {
  const userId = Number(payload.userId ?? payload.sub)
  if (!Number.isFinite(userId) || userId <= 0) {
    return null
  }
  return { userId }
}

function parseCookieHeader(cookieHeader: string | undefined | null): Record<string, string> {
  if (!cookieHeader) return {}
  const out: Record<string, string> = {}
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=')
    if (idx === -1) continue
    const key = part.slice(0, idx).trim()
    const value = part.slice(idx + 1).trim()
    if (key) out[key] = decodeURIComponent(value)
  }
  return out
}

function readCookie(req: NextApiRequest | Request, name: string): string | null {
  if (req instanceof Request) {
    const cookies = parseCookieHeader(req.headers.get('cookie'))
    return cookies[name] || null
  }
  if (req.cookies?.[name]) return req.cookies[name] || null
  const cookies = parseCookieHeader(req.headers.cookie)
  return cookies[name] || null
}

export function readSessionTokenFromRequest(req: NextApiRequest | Request): string | null {
  return readCookie(req, SESSION_COOKIE_NAME)
}

export async function getSessionFromRequest(
  req: NextApiRequest | Request
): Promise<SessionPayload | null> {
  const token = readSessionTokenFromRequest(req)
  if (!token) return null

  const payload = await verifySessionToken(token)
  if (!payload) return null

  const user = await prisma.users.findFirst({
    where: { id: payload.userId, status: 1 },
    select: { id: true, password: true },
  })
  if (!user) return null

  // Reject sessions issued before the latest password change (and legacy tokens without pwdv).
  if (!payload.pwdv || payload.pwdv !== passwordVersion(user.password)) {
    return null
  }

  return { userId: user.id }
}

export async function getPending2faFromRequest(
  req: NextApiRequest
): Promise<SessionPayload | null> {
  const token = readCookie(req, PENDING_2FA_COOKIE_NAME)
  if (!token) return null
  return verifyPending2faToken(token)
}

function shouldUseSecureCookies(): boolean {
  if (process.env.FORCE_SECURE_COOKIES === 'true' || process.env.FORCE_SECURE_COOKIES === '1') {
    return true
  }
  if (process.env.NODE_ENV === 'production') return true
  const base = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || ''
  try {
    return new URL(base).protocol === 'https:'
  } catch {
    return false
  }
}

function buildSetCookie(name: string, value: string, maxAge: number): string {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    `Max-Age=${maxAge}`,
    'HttpOnly',
    // Strict: session cookies must not ride along on cross-site navigations.
    'SameSite=Strict',
  ]
  if (shouldUseSecureCookies()) parts.push('Secure')
  return parts.join('; ')
}

function appendSetCookie(res: NextApiResponse, cookie: string): void {
  const prev = res.getHeader('Set-Cookie')
  if (!prev) {
    res.setHeader('Set-Cookie', cookie)
    return
  }
  const list = Array.isArray(prev) ? prev.map(String) : [String(prev)]
  list.push(cookie)
  res.setHeader('Set-Cookie', list)
}

export async function setSessionCookie(
  res: NextApiResponse,
  userId: number,
  passwordHash: string
): Promise<void> {
  const token = await createSessionToken(userId, passwordHash)
  appendSetCookie(res, buildSetCookie(SESSION_COOKIE_NAME, token, SESSION_MAX_AGE_SECONDS))
}

export function clearSessionCookie(res: NextApiResponse): void {
  appendSetCookie(res, buildSetCookie(SESSION_COOKIE_NAME, '', 0))
}

export async function setPending2faCookie(res: NextApiResponse, userId: number): Promise<void> {
  const token = await createPending2faToken(userId)
  appendSetCookie(res, buildSetCookie(PENDING_2FA_COOKIE_NAME, token, PENDING_2FA_MAX_AGE_SECONDS))
}

export function clearPending2faCookie(res: NextApiResponse): void {
  appendSetCookie(res, buildSetCookie(PENDING_2FA_COOKIE_NAME, '', 0))
}
