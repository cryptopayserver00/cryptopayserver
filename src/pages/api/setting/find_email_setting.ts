import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import { requireStorePermission, STORE_PERMISSION } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const access = await requireStorePermission(
      req,
      res,
      req.query.store_id,
      STORE_PERMISSION.ModifyStores,
      req.query.user_id
    )
    if (!access) return
    const { userId, storeId } = access

    const email_setting = await prisma.email_settings.findFirst({
      where: {
        store_id: storeId,
        user_id: userId,
        status: 1,
      },
    })

    if (!email_setting) {
      return res.status(200).json({
        message: 'Cannot find email setting',
        result: false,
        data: null,
      })
    }

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        id: email_setting.id,
        storeId: email_setting.store_id,
        userId: email_setting.user_id,
        status: email_setting.status,
        createdAt: email_setting.created_at,
        updatedAt: email_setting.updated_at,
        smtpServer: email_setting.smtp_server,
        port: email_setting.port,
        sender_email: email_setting.sender_email,
        login: email_setting.login,
        password: '',
        hasPassword: Boolean(email_setting.password),
        showTls: email_setting.show_tls,
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
