import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { EMAIL } from '@/utils/email'
import { prisma } from '@/lib/prisma'
import { requireStorePermission, STORE_PERMISSION } from '@/lib/auth'
import { decryptAndUpgrade } from '@/lib/crypto/secrets'
import { assertSafeHostname, isAllowedSmtpPort } from '@/lib/security/safe-url'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    // POST only — avoid CSRF via top-level GET navigation with session cookie.
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
    const { userId, storeId } = access

    const email = req.body.email
    if (!email) {
      return res.status(200).json({ message: 'Invalid email', result: false, data: null })
    }

    const email_setting = await prisma.email_settings.findFirst({
      where: {
        store_id: storeId,
        user_id: userId,
        status: 1,
      },
    })

    if (!email_setting) {
      return res.status(200).json({ message: 'Cannot find', result: false, data: null })
    }

    const safeHost = await assertSafeHostname(email_setting.smtp_server)
    if (!safeHost.ok) {
      return res.status(200).json({ message: safeHost.message, result: false, data: null })
    }
    if (!isAllowedSmtpPort(email_setting.port)) {
      return res.status(200).json({
        message: 'SMTP port must be one of 25, 465, 587, 2525',
        result: false,
        data: null,
      })
    }

    const subject = 'Test Email'
    const text = 'This is a test email.'

    const passwordUpgrade = decryptAndUpgrade(email_setting.password)
    if (passwordUpgrade.upgraded) {
      await prisma.email_settings.update({
        where: { id: email_setting.id },
        data: { password: passwordUpgrade.upgraded },
      })
    }

    const result = await EMAIL.sendEmailCore(
      email_setting.smtp_server,
      email_setting.port,
      email_setting.show_tls === 1,
      email_setting.login,
      passwordUpgrade.plaintext,
      email_setting.sender_email,
      String(email),
      subject,
      text
    )

    if (!result) {
      return res.status(200).json({ message: 'Cannot test', result: false, data: null })
    }

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
