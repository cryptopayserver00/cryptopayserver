import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getRedisClient } from '@/lib/redis'
import { rateLimit } from '@/lib/auth/rate-limit'
import { BLOCKSCAN } from '@/packages/web3/block_scan'

type CheckStatus = 'up' | 'down' | 'skipped'

type HealthResponse = {
  ok: boolean
  status: 'ok' | 'degraded'
  checks: {
    database: CheckStatus
    redis: CheckStatus
    blockscan: CheckStatus
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({
      ok: false,
      status: 'degraded',
      checks: { database: 'skipped', redis: 'skipped', blockscan: 'skipped' },
    })
  }

  // Generous limit — protects DB/Redis probe from abuse without breaking orchestrators.
  if (
    !(await rateLimit(req, res as Parameters<typeof rateLimit>[1], {
      scope: 'health',
      limit: 120,
      windowMs: 60 * 1000,
    }))
  ) {
    return
  }

  let database: CheckStatus = 'down'
  try {
    await prisma.$queryRaw`SELECT 1`
    database = 'up'
  } catch {
    console.error('health check db failed')
  }

  let redis: CheckStatus = 'skipped'
  const redisUrl = (process.env.REDIS_URL || '').trim()
  if (redisUrl) {
    try {
      const client = await getRedisClient()
      if (!client) {
        redis = 'down'
      } else {
        // Lightweight round-trip without depending on a ping() helper.
        const probeKey = `health:probe:${Date.now()}`
        await client.set(probeKey, '1', 'PX', 1000)
        const got = await client.get(probeKey)
        redis = got === '1' ? 'up' : 'down'
      }
    } catch {
      console.error('health check redis failed')
      redis = 'down'
    }
  }

  // Informational: unset Blockscan does not fail liveness (local/dev often omit it).
  const blockscan: CheckStatus = BLOCKSCAN.isConfigured ? 'up' : 'skipped'

  // Liveness follows database only — Redis outage degrades status but must not
  // fail Compose/K8s healthchecks when REDIS_URL is misconfigured.
  const alive = database === 'up'
  const fullyHealthy = alive && redis !== 'down'
  const body: HealthResponse = {
    ok: fullyHealthy,
    status: fullyHealthy ? 'ok' : 'degraded',
    checks: { database, redis, blockscan },
  }

  if (req.method === 'HEAD') {
    return res.status(alive ? 200 : 503).end()
  }

  return res.status(alive ? 200 : 503).json(body)
}
