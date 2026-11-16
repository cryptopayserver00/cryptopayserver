import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import {
  clearPending2faCookie,
  forbidden,
  hashPassword,
  rateLimit,
  requireAuthUserId,
  setSessionCookie,
  validatePasswordStrength,
  verifyPassword,
} from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.PUT) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const userId = await requireAuthUserId(req, res, req.body.user_id)
    if (!userId) return

    if (!(await rateLimit(req, res, { scope: `change-password:${userId}`, limit: 10, windowMs: 15 * 60 * 1000 }))) {
      return
    }

    const oldPwd = req.body.old_password
    if (!oldPwd) {
      return res.status(200).json({ message: 'Invalid oldPwd', result: false, data: null })
    }

    const newPwd = req.body.new_password
    if (!newPwd) {
      return res.status(200).json({ message: 'Invalid newPwd', result: false, data: null })
    }

    const passwordError = validatePasswordStrength(String(newPwd))
    if (passwordError) {
      return res.status(200).json({ message: passwordError, result: false, data: null })
    }

    const user = await prisma.users.findFirst({
      where: { id: userId, status: 1 },
    })
    if (!user) {
      return res.status(200).json({ message: 'Cannot find user', result: false, data: null })
    }

    const { ok } = await verifyPassword(oldPwd, user.password)
    if (!ok) {
      return forbidden(res, 'Invalid password')
    }

    const newCryptoPassword = await hashPassword(newPwd)

    await prisma.users.update({
      data: {
        password: newCryptoPassword,
      },
      where: {
        id: userId,
        status: 1,
      },
    })

    // Invalidate other sessions (pwdv changes) and re-issue cookie for this client.
    clearPending2faCookie(res)
    await setSessionCookie(res, userId, newCryptoPassword)

    return res.status(200).json({ message: '', result: true, data: null })
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      message: 'Internal server error',
      result: false,
      data: null,
    })
  }
}
