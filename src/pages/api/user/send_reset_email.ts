import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import { assertSameOrigin, createPasswordResetToken, rateLimit } from '@/lib/auth'
import { EMAIL } from '@/utils/email'

function resolveAppBaseUrl(): string | null {
  const raw = (process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || '').trim()
  if (!raw) return null
  try {
    const url = new URL(raw)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    // Strip trailing slash for consistent link joining
    return url.origin + (url.pathname.replace(/\/$/, '') || '')
  } catch {
    return null
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    if (!assertSameOrigin(req, res)) return

    if (!(await rateLimit(req, res, { scope: 'reset-email', limit: 5, windowMs: 60 * 60 * 1000 }))) {
      return
    }

    const email = String(req.body.email || '')
      .trim()
      .toLowerCase()
    if (!email) {
      return res.status(200).json({ message: 'Invalid email', result: false, data: null })
    }

    // Always return success to avoid account enumeration
    const success = { message: '', result: true, data: null }

    const baseUrl = resolveAppBaseUrl()
    if (!baseUrl) {
      console.error('[password-reset] APP_BASE_URL (or NEXT_PUBLIC_APP_URL) must be configured')
      // Still succeed to the client — do not leak configuration state.
      return res.status(200).json(success)
    }

    const user = await prisma.users.findFirst({
      where: {
        email: email,
        status: 1,
      },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
      },
    })

    if (!user) {
      return res.status(200).json(success)
    }

    const token = await createPasswordResetToken(user.id, user.email, user.password)
    // Put token in the URL fragment so it is not sent to the server / proxies / Referer.
    const resetUrl = `${baseUrl}/forgot-password#token=${encodeURIComponent(token)}`

    const subject = 'Reset your CryptoPayServer password'
    const text = `Hi ${user.username || user.email},\n\nUse this link to reset your password (valid for 15 minutes):\n${resetUrl}\n\nIf you did not request this, ignore this email.`
    const html = `<p>Hi ${user.username || user.email},</p><p>Use this link to reset your password (valid for 15 minutes):</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, ignore this email.</p>`

    const smtpHost = process.env.SMTP_HOST
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const smtpFrom = process.env.SMTP_FROM || smtpUser

    if (smtpHost && smtpUser && smtpPass && smtpFrom) {
      const port = Number(process.env.SMTP_PORT || 587)
      const secure = process.env.SMTP_SECURE === 'true' || port === 465
      await EMAIL.sendEmailCore(
        smtpHost,
        port,
        secure,
        smtpUser,
        smtpPass,
        smtpFrom,
        user.email,
        subject,
        text,
        html
      )
    } else {
      // Dev / unconfigured SMTP: log that a reset was issued — never log the raw token URL.
      console.info('[password-reset] email queued for', user.email, '(SMTP not configured)')
    }

    return res.status(200).json(success)
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      message: 'Internal server error',
      result: false,
      data: null,
    })
  }
}
