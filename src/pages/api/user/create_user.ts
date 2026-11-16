import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import { hashPassword, rateLimit, validatePasswordStrength } from '@/lib/auth'

export default async function handle(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    if (!rateLimit(req, res, { scope: 'register', limit: 5, windowMs: 60 * 60 * 1000 })) {
      return
    }

    if (process.env.DISABLE_PUBLIC_REGISTRATION === 'true') {
      return res.status(403).json({
        message: 'Public registration is disabled',
        result: false,
        data: null,
      })
    }

    const email = req.body.email
    if (!email) {
      return res.status(200).json({ message: 'Invalid email', result: false, data: null })
    }

    const password = req.body.password
    if (!password) {
      return res.status(200).json({ message: 'Invalid password', result: false, data: null })
    }

    const passwordError = validatePasswordStrength(String(password))
    if (passwordError) {
      return res.status(200).json({ message: passwordError, result: false, data: null })
    }

    const username = req.body.username
    const cryptoPassword = await hashPassword(password)

    const normalizedEmail = String(email).trim().toLowerCase()
    // Reject active and soft-deleted emails so re-registration cannot revive invites.
    const existing = await prisma.users.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { email: String(email).trim() }],
      },
      select: { id: true },
    })
    if (existing) {
      // Same outer shape as other failures — avoid a distinct success path for enumeration.
      return res
        .status(200)
        .json({ message: 'Unable to create account with that email', result: false, data: null })
    }

    await prisma.users.create({
      data: {
        email: normalizedEmail,
        username: username ? username : '',
        password: cryptoPassword,
        profile_picture_url: '',
        authenticator: '',
        status: 1,
      },
    })

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
