import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import type { NextApiRequest, NextApiResponse } from 'next'
import { requireCronSecret } from '../src/lib/auth/cron'
import { CRON_HEADER_NAME } from '../src/lib/auth/constants'

function mockReq(headers: Record<string, string> = {}): NextApiRequest {
  return { headers } as unknown as NextApiRequest
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

describe('requireCronSecret', () => {
  const prev = process.env.CRON_SECRET

  beforeEach(() => {
    process.env.CRON_SECRET = 'cron-secret-at-least-16'
  })

  afterEach(() => {
    if (prev === undefined) delete process.env.CRON_SECRET
    else process.env.CRON_SECRET = prev
  })

  it('accepts matching header', () => {
    const { res } = mockRes()
    expect(
      requireCronSecret(mockReq({ [CRON_HEADER_NAME]: 'cron-secret-at-least-16' }), res)
    ).toBe(true)
  })

  it('rejects missing header', () => {
    const out = mockRes()
    expect(requireCronSecret(mockReq({}), out.res)).toBe(false)
    expect(out.statusCode).toBe(401)
  })

  it('rejects wrong secret (timing-safe)', () => {
    const out = mockRes()
    expect(
      requireCronSecret(mockReq({ [CRON_HEADER_NAME]: 'xxxxxxxxxxxxxxxxxx' }), out.res)
    ).toBe(false)
    expect(out.statusCode).toBe(401)
  })

  it('rejects when CRON_SECRET is too short', () => {
    process.env.CRON_SECRET = 'short'
    const out = mockRes()
    expect(requireCronSecret(mockReq({ [CRON_HEADER_NAME]: 'short' }), out.res)).toBe(false)
    expect(out.statusCode).toBe(401)
  })
})
