import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import {
  forbidden,
  getStoreAccess,
  requireAuth,
  STORE_PERMISSION,
  storeAccessHasPermission,
} from '@/lib/auth'
import { encryptSecret } from '@/lib/crypto/secrets'
import { assertSafeHostname, isAllowedSmtpPort } from '@/lib/security/safe-url'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.PUT) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const session = await requireAuth(req, res)
    if (!session) return

    const id = Number(req.body.id)
    if (!id) {
      return res.status(200).json({ message: 'Invalid id', result: false, data: null })
    }

    const existing = await prisma.email_settings.findFirst({
      where: { id, status: 1 },
      select: { id: true, store_id: true },
    })
    if (!existing) {
      return forbidden(res)
    }

    const access = await getStoreAccess(existing.store_id, session.userId)
    if (!access || !storeAccessHasPermission(access, STORE_PERMISSION.ModifyStores)) {
      return forbidden(res, 'Insufficient store permission')
    }

    let updateData: { [key: string]: any } = {}

    if (req.body.smtp_server) {
      const safeHost = await assertSafeHostname(String(req.body.smtp_server))
      if (!safeHost.ok) {
        return res.status(200).json({ message: safeHost.message, result: false, data: null })
      }
      updateData.smtp_server = safeHost.host
    }
    if (req.body.port !== undefined && req.body.port !== null && req.body.port !== '') {
      const port = Number(req.body.port)
      if (!isAllowedSmtpPort(port)) {
        return res.status(200).json({
          message: 'SMTP port must be one of 25, 465, 587, 2525',
          result: false,
          data: null,
        })
      }
      updateData.port = port
    }
    if (req.body.sender_email) updateData.sender_email = req.body.sender_email
    if (req.body.login) updateData.login = req.body.login
    if (req.body.password) {
      const nextPassword = String(req.body.password)
      // Ignore UI mask placeholders (same convention as webhook/Shopify secrets).
      if (nextPassword && !nextPassword.startsWith('•')) {
        updateData.password = encryptSecret(nextPassword)
      }
    }
    if (req.body.show_tls) updateData.show_tls = Number(req.body.show_tls)

    await prisma.email_settings.update({
      data: updateData,
      where: {
        id: id,
        user_id: access.ownerUserId,
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
