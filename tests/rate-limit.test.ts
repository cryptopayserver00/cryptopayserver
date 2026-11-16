import { describe, expect, it, beforeEach } from 'vitest'
import type { NextApiRequest, NextApiResponse } from 'next'
import { clearRateLimitBuckets, rateLimit } from '../src/lib/auth/rate-limit'

function mockReq(ip = '127.0.0.1'): NextApiRequest {
  return {
    headers: {},
    socket: { remoteAddress: ip },
  } as unknown as NextApiRequest
}

function mockRes() {
  const headers: Record<string, string> = {}
  let statusCode = 200
  let body: unknown = null
  const res = {
    setHeader(key: string, value: string) {
      headers[key] = value
    },
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
      return body
    },
    get headers() {
      return headers
    },
  }
}

describe('rateLimit', () => {
  beforeEach(() => {
    clearRateLimitBuckets()
    delete process.env.REDIS_URL
  })

  it('allows requests under the limit', async () => {
    const req = mockReq('10.0.0.1')
    for (let i = 0; i < 3; i++) {
      const out = mockRes()
      expect(await rateLimit(req, out.res, { scope: 'test-a', limit: 3, windowMs: 60_000 })).toBe(
        true
      )
      expect(out.statusCode).toBe(200)
    }
  })

  it('blocks when the limit is exceeded', async () => {
    const req = mockReq('10.0.0.2')
    for (let i = 0; i < 2; i++) {
      const out = mockRes()
      expect(await rateLimit(req, out.res, { scope: 'test-b', limit: 2, windowMs: 60_000 })).toBe(
        true
      )
    }
    const blocked = mockRes()
    expect(await rateLimit(req, blocked.res, { scope: 'test-b', limit: 2, windowMs: 60_000 })).toBe(
      false
    )
    expect(blocked.statusCode).toBe(429)
    expect(blocked.headers['Retry-After']).toBeTruthy()
  })
})
