import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { EMAIL } from '@/utils/email'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const storeId = Number(req.query.store_id)
    if (!storeId) {
      return res.status(200).json({ message: 'Invalid storeId', result: false, data: null })
    }

    const userId = Number(req.query.user_id)
    if (!userId) {
      return res.status(200).json({ message: 'Invalid userId', result: false, data: null })
    }

    const email = req.query.email
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

    const subject = 'Test Email'
    const text = 'This is a test email.'

    const result = await EMAIL.sendEmailCore(
      email_setting.smtp_server,
      email_setting.port,
      email_setting.show_tls === 1,
      email_setting.login,
      email_setting.password,
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
