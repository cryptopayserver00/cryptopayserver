import { timingSafeEqual } from 'crypto'
import type { NextApiRequest, NextApiResponse } from 'next'
import { CRON_HEADER_NAME } from './constants'

type JsonRes = {
  status: (code: number) => JsonRes
  json: (body: { message: string; result: boolean; data: null }) => unknown
}

/**
 * Authenticate internal schedule workers via shared CRON_SECRET header.
 */
export function requireCronSecret(req: NextApiRequest, res: NextApiResponse | JsonRes): boolean {
  const expected = process.env.CRON_SECRET
  if (!expected || expected.length < 16) {
    console.error('CRON_SECRET is not configured')
    res.status(401).json({ message: 'Cron not configured', result: false, data: null })
    return false
  }

  const header = req.headers[CRON_HEADER_NAME]
  const value = Array.isArray(header) ? header[0] : header
  if (!value || typeof value !== 'string') {
    res.status(401).json({ message: 'Invalid cron secret', result: false, data: null })
    return false
  }

  const a = Buffer.from(value)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    res.status(401).json({ message: 'Invalid cron secret', result: false, data: null })
    return false
  }
  return true
}
