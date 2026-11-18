import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import type { NextApiRequest, NextApiResponse } from 'next'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}))

vi.mock('@/lib/redis', () => ({
  getRedisClient: vi.fn(),
}))

import { prisma } from '@/lib/prisma'
import { getRedisClient } from '@/lib/redis'
import handler from '../src/pages/api/health'

function mockReq(method = 'GET'): NextApiRequest {
  return {
    method,
    headers: {},
    socket: { remoteAddress: '127.0.0.1' },
  } as unknown as NextApiRequest
}

function mockRes() {
  const headers: Record<string, string> = {}
  let statusCode = 200
  let body: unknown = null
  let ended = false
  const res = {
    setHeader(key: string, value: string) {
      headers[key] = value
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
    end() {
      ended = true
      return this
    },
  } as unknown as NextApiResponse
  return {
    res,
    headers,
    get statusCode() {
      return statusCode
    },
    get body() {
      return body as {
        ok?: boolean
        status?: string
        checks?: { database?: string; redis?: string; blockscan?: string }
      } | null
    },
    get ended() {
      return ended
    },
  }
}

describe('health', () => {
  const prevRedis = process.env.REDIS_URL

  beforeEach(() => {
    vi.mocked(prisma.$queryRaw).mockReset()
    vi.mocked(getRedisClient).mockReset()
    delete process.env.REDIS_URL
  })

  afterEach(() => {
    if (prevRedis === undefined) delete process.env.REDIS_URL
    else process.env.REDIS_URL = prevRedis
  })

  it('returns 200 when database is up and redis unset', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue(1 as never)
    const out = mockRes()
    await handler(mockReq(), out.res)
    expect(out.headers['Cache-Control']).toBe('no-store')
    expect(out.statusCode).toBe(200)
    expect(out.body?.ok).toBe(true)
    expect(out.body?.checks?.database).toBe('up')
    expect(out.body?.checks?.redis).toBe('skipped')
    expect(out.body?.checks?.blockscan === 'up' || out.body?.checks?.blockscan === 'skipped').toBe(
      true
    )
  })

  it('returns 503 when database is down', async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error('db down'))
    const out = mockRes()
    await handler(mockReq(), out.res)
    expect(out.statusCode).toBe(503)
    expect(out.body?.ok).toBe(false)
    expect(out.body?.checks?.database).toBe('down')
  })

  it('stays alive (200 degraded) when redis configured but down', async () => {
    process.env.REDIS_URL = 'redis://127.0.0.1:6379/0'
    vi.mocked(prisma.$queryRaw).mockResolvedValue(1 as never)
    vi.mocked(getRedisClient).mockResolvedValue(null)
    const out = mockRes()
    await handler(mockReq(), out.res)
    expect(out.statusCode).toBe(200)
    expect(out.body?.ok).toBe(false)
    expect(out.body?.status).toBe('degraded')
    expect(out.body?.checks?.redis).toBe('down')
  })

  it('supports HEAD without a body', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValue(1 as never)
    const out = mockRes()
    await handler(mockReq('HEAD'), out.res)
    expect(out.statusCode).toBe(200)
    expect(out.ended).toBe(true)
  })
})
