import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

type HealthResponse = {
  ok: boolean
  status: 'ok' | 'degraded'
  checks: {
    database: 'up' | 'down'
  }
}

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  let database: 'up' | 'down' = 'down'
  try {
    await prisma.$queryRaw`SELECT 1`
    database = 'up'
  } catch (e) {
    console.error('health check db failed', e)
  }

  const ok = database === 'up'
  return res.status(ok ? 200 : 503).json({
    ok,
    status: ok ? 'ok' : 'degraded',
    checks: { database },
  })
}
