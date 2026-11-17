import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import type { NextApiRequest, NextApiResponse } from 'next'
import { assertSameOrigin } from '../src/lib/auth/csrf'

function mockReq(overrides: Partial<NextApiRequest> & { method?: string; headers?: Record<string, string> }) {
  return {
    method: overrides.method || 'POST',
    headers: overrides.headers || {},
  } as unknown as NextApiRequest
}

function mockRes() {
  let statusCode = 200
  let body: unknown = null
  const res = {
    status(code: number) {
      statusCode = code
      return this
    },
    json(payload: unknown) {
      body = payload
      return this
    },
  } as unknown as NextApiResponse
  return {
    res,
    get statusCode() {
      return statusCode
    },
    get body() {
      return body as { message?: string } | null
    },
  }
}

describe('assertSameOrigin', () => {
  const keys = ['APP_BASE_URL', 'NEXT_PUBLIC_APP_URL', 'CORS_ORIGIN', 'NODE_ENV'] as const
  const prev: Record<string, string | undefined> = {}

  beforeEach(() => {
    for (const k of keys) prev[k] = process.env[k]
    process.env.APP_BASE_URL = 'https://pay.example.com'
    delete process.env.NEXT_PUBLIC_APP_URL
    delete process.env.CORS_ORIGIN
    process.env.NODE_ENV = 'test'
  })

  afterEach(() => {
    for (const k of keys) {
      if (prev[k] === undefined) delete process.env[k]
      else process.env[k] = prev[k]
    }
  })

  it('allows GET without origin checks', () => {
    const { res, statusCode } = mockRes()
    expect(assertSameOrigin(mockReq({ method: 'GET', headers: {} }), res)).toBe(true)
    expect(statusCode).toBe(200)
  })

  it('allows matching Origin', () => {
    const { res } = mockRes()
    expect(
      assertSameOrigin(
        mockReq({ headers: { origin: 'https://pay.example.com' } }),
        res
      )
    ).toBe(true)
  })

  it('rejects mismatched Origin', () => {
    const out = mockRes()
    expect(
      assertSameOrigin(mockReq({ headers: { origin: 'https://evil.example' } }), out.res)
    ).toBe(false)
    expect(out.statusCode).toBe(403)
    expect(out.body?.message).toBe('Invalid origin')
  })

  it('allows matching Referer when Origin absent', () => {
    const { res } = mockRes()
    expect(
      assertSameOrigin(
        mockReq({ headers: { referer: 'https://pay.example.com/settings' } }),
        res
      )
    ).toBe(true)
  })

  it('rejects POST with neither Origin nor Referer', () => {
    const out = mockRes()
    expect(assertSameOrigin(mockReq({ headers: {} }), out.res)).toBe(false)
    expect(out.statusCode).toBe(403)
    expect(out.body?.message).toBe('Missing origin')
  })

  it('fails closed in production without APP_BASE_URL allowlist', () => {
    delete process.env.APP_BASE_URL
    delete process.env.NEXT_PUBLIC_APP_URL
    delete process.env.CORS_ORIGIN
    process.env.NODE_ENV = 'production'
    const out = mockRes()
    expect(
      assertSameOrigin(mockReq({ headers: { origin: 'https://anywhere.example' } }), out.res)
    ).toBe(false)
    expect(out.statusCode).toBe(403)
  })

  it('allows localhost when APP_BASE_URL is 127.0.0.1 in non-production', () => {
    process.env.APP_BASE_URL = 'http://127.0.0.1:8888'
    process.env.NODE_ENV = 'development'
    const { res } = mockRes()
    expect(
      assertSameOrigin(mockReq({ headers: { origin: 'http://localhost:8888' } }), res)
    ).toBe(true)
  })

  it('accepts bare host:port in CORS_ORIGIN', () => {
    delete process.env.APP_BASE_URL
    delete process.env.NEXT_PUBLIC_APP_URL
    process.env.CORS_ORIGIN = '127.0.0.1:8888'
    process.env.NODE_ENV = 'development'
    const { res } = mockRes()
    expect(
      assertSameOrigin(mockReq({ headers: { origin: 'http://127.0.0.1:8888' } }), res)
    ).toBe(true)
  })
})
