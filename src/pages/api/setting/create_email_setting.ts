import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const userId = Number(req.body.user_id)
    if (!userId) {
      return res.status(200).json({ message: 'Invalid userId', result: false, data: null })
    }

    const storeId = Number(req.body.store_id)
    if (!storeId) {
      return res.status(200).json({ message: 'Invalid storeId', result: false, data: null })
    }

    const port = Number(req.body.port)
    if (!port) {
      return res.status(200).json({ message: 'Invalid port', result: false, data: null })
    }

    const smtpServer = req.body.smtp_server
    const senderEmail = req.body.sender_email
    const login = req.body.login
    const password = req.body.password
    const showTls = req.body.show_tls

    const email_setting = await prisma.email_settings.create({
      data: {
        user_id: userId,
        store_id: storeId,
        smtp_server: smtpServer,
        port: port,
        sender_email: senderEmail,
        login: login,
        password: password,
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
