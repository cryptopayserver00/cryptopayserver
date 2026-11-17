import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import { rateLimit, requireStorePermission, STORE_PERMISSION } from '@/lib/auth'
import { encryptSecret } from '@/lib/crypto/secrets'
import { assertSafeHostname, isAllowedSmtpPort } from '@/lib/security/safe-url'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const access = await requireStorePermission(
      req,
      res,
      req.body.store_id,
      STORE_PERMISSION.ModifyStores,
      req.body.user_id
    )
    if (!access) return

    if (!(await rateLimit(req, res, { scope: `create_email_setting:${access.userId}`, limit: 60, windowMs: 15 * 60 * 1000 }))) {
      return
    }
    const userId = access.userId
    const storeId = access.storeId

    const port = Number(req.body.port)
    if (!isAllowedSmtpPort(port)) {
      return res.status(200).json({
        message: 'SMTP port must be one of 25, 465, 587, 2525',
        result: false,
        data: null,
      })
    }

    const smtpServer = String(req.body.smtp_server || '')
    const safeHost = await assertSafeHostname(smtpServer)
    if (!safeHost.ok) {
      return res.status(200).json({ message: safeHost.message, result: false, data: null })
    }

    const senderEmail = req.body.sender_email
    const login = req.body.login
    const password = req.body.password
    const showTls = req.body.show_tls

    const email_setting = await prisma.email_settings.create({
      data: {
        user_id: userId,
        store_id: storeId,
        smtp_server: safeHost.host,
        port: port,
        sender_email: senderEmail,
        login: login,
        password: encryptSecret(String(password || '')),
        show_tls: showTls,
        status: 1,
      },
    })

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        id: email_setting.id,
      },
    })
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      message: 'Internal server error',
      result: false,
      data: null,
    })
  }
}
