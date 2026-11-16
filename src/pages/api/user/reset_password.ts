import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import {
  assertSameOrigin,
  clearPending2faCookie,
  clearSessionCookie,
  consumePasswordResetTokenJti,
  hashPassword,
  passwordVersion,
  rateLimit,
  validatePasswordStrength,
  verifyPasswordResetToken,
} from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    if (!assertSameOrigin(req, res)) return

    if (!(await rateLimit(req, res, { scope: 'reset-password', limit: 10, windowMs: 60 * 60 * 1000 }))) {
      return
    }

    const token = String(req.body.token || '')
    const password = String(req.body.password || '')
    if (!token || !password) {
      return res.status(200).json({ message: 'Invalid request', result: false, data: null })
    }

    const passwordError = validatePasswordStrength(password)
    if (passwordError) {
      return res.status(200).json({ message: passwordError, result: false, data: null })
    }

    const payload = await verifyPasswordResetToken(token)
    if (!payload) {
      return res.status(200).json({ message: 'Invalid or expired token', result: false, data: null })
    }

    const user = await prisma.users.findFirst({
      where: { id: payload.userId, email: payload.email, status: 1 },
      select: { id: true, password: true },
    })
    if (!user) {
      return res.status(200).json({ message: 'Invalid or expired token', result: false, data: null })
    }

    // Bound to pre-reset password fingerprint.
    if (!payload.pwdv || payload.pwdv !== passwordVersion(user.password)) {
      return res.status(200).json({ message: 'Invalid or expired token', result: false, data: null })
    }

    // True one-time use via jti (pwdv alone still allows reuse until password changes).
    if (!(await consumePasswordResetTokenJti(payload.jti))) {
      return res.status(200).json({ message: 'Invalid or expired token', result: false, data: null })
    }

    const nextHash = await hashPassword(password)
    await prisma.users.update({
      where: { id: user.id },
      data: { password: nextHash },
    })

    // Drop any existing browser session; user must log in with the new password.
    clearSessionCookie(res)
    clearPending2faCookie(res)

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
