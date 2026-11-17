import { describe, expect, it, beforeEach, vi } from 'vitest'
import type { NextApiRequest, NextApiResponse } from 'next'
import { clearRateLimitBuckets } from '../src/lib/auth/rate-limit'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    wallets: {
      update: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth/password', () => ({
  verifyPassword: vi.fn(),
  hashPassword: vi.fn(),
}))

import { prisma } from '@/lib/prisma'
import { verifyPassword, hashPassword } from '@/lib/auth/password'
import { requireWalletPasswordIfSet } from '@/lib/auth/wallet-password'

function mockReq(ip = '10.0.0.8'): NextApiRequest {
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
      return body as { message?: string } | null
    },
  }
}

describe('requireWalletPasswordIfSet', () => {
  beforeEach(() => {
    clearRateLimitBuckets()
    vi.mocked(verifyPassword).mockReset()
    vi.mocked(hashPassword).mockReset()
    vi.mocked(prisma.wallets.update).mockReset()
  })

  it('forbids wallets without a password', async () => {
    const out = mockRes()
    const ok = await requireWalletPasswordIfSet(mockReq(), out.res, { id: 1, password: null }, 'x')
    expect(ok).toBe(false)
    expect(out.statusCode).toBe(403)
    expect(out.body?.message).toMatch(/Set a wallet password/)
  })

  it('requires password when wallet has one', async () => {
    const out = mockRes()
    const ok = await requireWalletPasswordIfSet(mockReq(), out.res, { id: 1, password: 'hash' }, '')
    expect(ok).toBe(false)
    expect(out.statusCode).toBe(403)
  })

  it('rejects invalid wallet password', async () => {
    vi.mocked(verifyPassword).mockResolvedValue({ ok: false, needsRehash: false })
    const out = mockRes()
    const ok = await requireWalletPasswordIfSet(
      mockReq(),
      out.res,
      { id: 2, password: 'hash' },
      'wrong'
    )
    expect(ok).toBe(false)
    expect(out.body?.message).toBe('Invalid wallet password')
  })

  it('accepts valid password and rehashes when needed', async () => {
    vi.mocked(verifyPassword).mockResolvedValue({ ok: true, needsRehash: true })
    vi.mocked(hashPassword).mockResolvedValue('new-hash')
    vi.mocked(prisma.wallets.update).mockResolvedValue({} as never)
    const out = mockRes()
    const ok = await requireWalletPasswordIfSet(
      mockReq(),
      out.res,
      { id: 3, password: 'legacy' },
      'good'
    )
    expect(ok).toBe(true)
    expect(prisma.wallets.update).toHaveBeenCalled()
  })
})
