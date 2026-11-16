import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import { requireAuthUserId, verifyPassword } from '@/lib/auth'
import { decryptAndUpgrade, encryptSecret } from '@/lib/crypto/secrets'
import { VerifyAuthenticator } from '@/utils/totp'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.PUT) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const userId = await requireAuthUserId(req, res, req.body.user_id)
    if (!userId) return

    const currentUser = await prisma.users.findFirst({
      where: { id: userId, status: 1 },
    })
    if (!currentUser) {
      return res.status(200).json({ message: 'User not found', result: false, data: null })
    }

    const updateData: Record<string, any> = {}

    if (req.body.username) updateData.username = req.body.username
    if (req.body.profile_picture_url) updateData.profile_picture_url = req.body.profile_picture_url

    if ('authenticator' in req.body) {
      const raw = String(req.body.authenticator ?? '')
      const accountPassword = String(req.body.password || '')
      if (!accountPassword) {
        return res.status(200).json({
          message: 'Account password required to change 2FA',
          result: false,
          data: null,
        })
      }

      const { ok } = await verifyPassword(accountPassword, currentUser.password)
      if (!ok) {
        return res.status(200).json({ message: 'Invalid password', result: false, data: null })
      }

      // Disabling or replacing an existing authenticator requires a valid CURRENT TOTP.
      if (currentUser.authenticator) {
        const currentCode = String(
          req.body.current_totp_code || req.body.totp_code || ''
        ).trim()
        if (!currentCode) {
          return res.status(200).json({
            message: 'Authenticator code required to change 2FA',
            result: false,
            data: null,
          })
        }
        const { plaintext, upgraded } = decryptAndUpgrade(currentUser.authenticator)
        if (upgraded) {
          await prisma.users.update({
            where: { id: userId },
            data: { authenticator: upgraded },
          })
        }
        if (!VerifyAuthenticator(currentCode, plaintext)) {
          return res
            .status(200)
            .json({ message: 'Invalid authenticator code', result: false, data: null })
        }
      }

      // Enabling / replacing: also verify a code for the NEW secret server-side.
      if (raw) {
        const setupCode = String(req.body.setup_totp_code || req.body.totp_code || '').trim()
        // When replacing, totp_code is the current code — require dedicated setup_totp_code.
        const codeForNew = currentUser.authenticator
          ? String(req.body.setup_totp_code || '').trim()
          : setupCode
        if (!codeForNew || !VerifyAuthenticator(codeForNew, raw)) {
          return res.status(200).json({
            message: 'Invalid setup authenticator code',
            result: false,
            data: null,
          })
        }
      }

      updateData.authenticator = raw ? encryptSecret(raw) : ''
    }

    const email = req.body.email
    if (email) {
      const emailStr = String(email).trim().toLowerCase()
      const currentEmail = String(currentUser.email || '').trim().toLowerCase()

      if (emailStr && emailStr !== currentEmail) {
        const accountPassword = String(req.body.password || '')
        if (!accountPassword) {
          return res.status(200).json({
            message: 'Account password required to change email',
            result: false,
            data: null,
          })
        }
        const { ok } = await verifyPassword(accountPassword, currentUser.password)
        if (!ok) {
          return res.status(200).json({ message: 'Invalid password', result: false, data: null })
        }

        const existing = await prisma.users.findFirst({
          where: {
            OR: [{ email: emailStr }, { email: String(email).trim() }],
            NOT: { id: userId },
          },
          select: { id: true },
        })
        if (existing) {
          return res.status(200).json({
            message: 'Unable to change email',
            result: false,
            data: null,
          })
        }

        // Block hijacking an outstanding store invite by switching to that email.
        const invite = await prisma.user_roles.findFirst({
          where: {
            status: 1,
            OR: [{ email: emailStr }, { email: String(email).trim() }],
            NOT: { role: 'Owner' },
          },
          select: { id: true },
        })
        if (invite) {
          return res.status(200).json({
            message: 'Unable to change email',
            result: false,
            data: null,
          })
        }

        updateData.email = emailStr
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(200).json({ message: '', result: true, data: null })
    }

    await prisma.users.update({
      data: updateData,
      where: {
        id: userId,
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
