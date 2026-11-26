import type { NextApiRequest, NextApiResponse } from 'next'
import type { ResponseData } from '@/pages/api'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from './password'
import { rateLimit } from './rate-limit'

/**
 * Require the account login password for high-risk actions (send / export / LN pay).
 * Only failed password attempts count toward the rate limit — successful step-ups
 * in multi-page flows (e.g. mnemonic reveal → confirm backup) must not lock the user out.
 */
export async function requireAccountPassword(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  userId: number,
  passwordRaw: unknown,
  message = 'Account password required'
): Promise<boolean> {
  const password = String(passwordRaw || '')
  if (!password) {
    // 200 so UI interceptors can surface the message (axios only resolves 200).
    res.status(200).json({ message, result: false, data: null })
    return false
  }

  const user = await prisma.users.findFirst({
    where: { id: userId, status: 1 },
    select: { password: true },
  })
  if (!user) {
    res.status(403).json({ message: 'Forbidden', result: false, data: null })
    return false
  }

  const { ok } = await verifyPassword(password, user.password)
  if (!ok) {
    // Count only failures to slow brute force on hijacked sessions.
    if (
      !(await rateLimit(req, res, {
        scope: `step-up:${userId}`,
        limit: 10,
        windowMs: 15 * 60 * 1000,
      }))
    ) {
      return false
    }
    res.status(200).json({ message: 'Invalid account password', result: false, data: null })
    return false
  }

  return true
}
