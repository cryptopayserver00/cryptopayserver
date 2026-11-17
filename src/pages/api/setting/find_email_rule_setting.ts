import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import { rateLimit, requireStorePermission, STORE_PERMISSION } from '@/lib/auth'

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
      STORE_PERMISSION.ViewStores,
      req.query.user_id
    )
    if (!access) return

    if (!(await rateLimit(req, res, { scope: 'rl-find_email_rule_setting', limit: 120, windowMs: 15 * 60 * 1000 }))) {
      return
    }
    const { userId, storeId } = access

    const email_rule_setting = await prisma.email_rule_settings.findMany({
      where: {
        user_id: userId,
        store_id: storeId,
        status: 1,
      },
    })

    return res.status(200).json({
      message: '',
      result: true,
      data: email_rule_setting.map((item) => ({
        id: item.id,
        userId: item.user_id,
        storeId: item.store_id,
        status: item.status,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        trigger: item.trigger,
        recipients: item.recipients,
        showSendToBuyer: item.show_send_to_buyer,
        subject: item.subject,
        body: item.body,
      })),
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
