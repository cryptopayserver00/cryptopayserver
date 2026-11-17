import { describe, expect, it, afterEach } from 'vitest'
import {
  getPending2faCookieName,
  getSessionCookieName,
  SESSION_COOKIE_BASE_NAME,
  PENDING_2FA_COOKIE_BASE_NAME,
} from '../src/lib/auth/constants'

describe('cookie names', () => {
  const prev = process.env.USE_HOST_PREFIX_COOKIES

  afterEach(() => {
    if (prev === undefined) delete process.env.USE_HOST_PREFIX_COOKIES
    else process.env.USE_HOST_PREFIX_COOKIES = prev
  })

  it('uses base names by default', () => {
    delete process.env.USE_HOST_PREFIX_COOKIES
    expect(getSessionCookieName()).toBe(SESSION_COOKIE_BASE_NAME)
    expect(getPending2faCookieName()).toBe(PENDING_2FA_COOKIE_BASE_NAME)
  })

  it('prefixes __Host- when enabled', () => {
    process.env.USE_HOST_PREFIX_COOKIES = 'true'
    expect(getSessionCookieName()).toBe(`__Host-${SESSION_COOKIE_BASE_NAME}`)
    expect(getPending2faCookieName()).toBe(`__Host-${PENDING_2FA_COOKIE_BASE_NAME}`)
  })
})
