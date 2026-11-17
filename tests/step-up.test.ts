import { describe, expect, it, beforeEach, vi } from 'vitest'
import type { NextApiRequest, NextApiResponse } from 'next'
import { clearRateLimitBuckets } from '../src/lib/auth/rate-limit'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    users: {
      findFirst: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth/password', () => ({
  verifyPassword: vi.fn(),
}))

import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth/password'
import { requireAccountPassword } from '@/lib/auth/step-up'

function mockReq(ip = '10.0.0.9'): NextApiRequest {
  return {
    headers: {},
    socket: { remoteAddress: ip },
  } as unknown as NextApiRequest
}

function mockRes() {
  let statusCode = 200
  let body: unknown = null
  const res = {
    setHeader() {
      return this
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
      return body as { message?: string; result?: boolean } | null
    },
  }
}

describe('requireAccountPassword', () => {
  beforeEach(() => {
    clearRateLimitBuckets()
    vi.mocked(prisma.users.findFirst).mockReset()
    vi.mocked(verifyPassword).mockReset()
  })

  it('rejects empty password with 200 message', async () => {
    const out = mockRes()
    const ok = await requireAccountPassword(mockReq(), out.res, 1, '', 'Need password')
    expect(ok).toBe(false)
    expect(out.statusCode).toBe(200)
    expect(out.body?.message).toBe('Need password')
  })

  it('rejects invalid password', async () => {
    vi.mocked(prisma.users.findFirst).mockResolvedValue({ password: 'hash' } as never)
    vi.mocked(verifyPassword).mockResolvedValue({ ok: false, needsRehash: false })
    const out = mockRes()
    const ok = await requireAccountPassword(mockReq(), out.res, 1, 'wrong')
    expect(ok).toBe(false)
    expect(out.body?.message).toBe('Invalid account password')
  })

  it('accepts valid password', async () => {
    vi.mocked(prisma.users.findFirst).mockResolvedValue({ password: 'hash' } as never)
    vi.mocked(verifyPassword).mockResolvedValue({ ok: true, needsRehash: false })
    const out = mockRes()
    const ok = await requireAccountPassword(mockReq(), out.res, 1, 'correct-pass')
    expect(ok).toBe(true)
  })

  it('rate-limits repeated attempts for the same user/ip', async () => {
    vi.mocked(prisma.users.findFirst).mockResolvedValue({ password: 'hash' } as never)
    vi.mocked(verifyPassword).mockResolvedValue({ ok: false, needsRehash: false })

    for (let i = 0; i < 10; i++) {
      const out = mockRes()
      await requireAccountPassword(mockReq(), out.res, 7, 'wrong')
    }
    const blocked = mockRes()
    const ok = await requireAccountPassword(mockReq(), blocked.res, 7, 'wrong')
    expect(ok).toBe(false)
    expect(blocked.statusCode).toBe(429)
  })
})
