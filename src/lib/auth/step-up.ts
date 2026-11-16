import type { NextApiResponse } from 'next'
import type { ResponseData } from '@/pages/api'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from './password'

/**
 * Require the account login password for high-risk actions (send / export / LN pay).
 */
export async function requireAccountPassword(
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
    res.status(200).json({ message: 'Invalid account password', result: false, data: null })
    return false
  }

  return true
}
