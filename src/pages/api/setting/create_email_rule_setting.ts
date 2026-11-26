import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import { rateLimit, requireStorePermission, STORE_PERMISSION } from '@/lib/auth'

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

    if (!(await rateLimit(req, res, { scope: `create_email_rule_setting:${access.userId}`, limit: 60, windowMs: 15 * 60 * 1000 }))) {
      return
    }
    const userId = access.userId
    const storeId = access.storeId

    const trigger = Number(req.body.trigger)
    const recipients = String(req.body.recipients || '')
    const showSendToBuyer = Number(req.body.show_send_to_buyer)
    const subject = String(req.body.subject || '')
    const body = String(req.body.body || '')

    if (!Number.isInteger(trigger) || trigger <= 0) {
      return res.status(200).json({ message: 'Invalid trigger', result: false, data: null })
    }
    if (!Number.isInteger(showSendToBuyer) || ![1, 2].includes(showSendToBuyer)) {
      return res.status(200).json({ message: 'Invalid show_send_to_buyer', result: false, data: null })
    }

    const email_rule_setting = await prisma.email_rule_settings.create({
      data: {
        user_id: userId,
        store_id: storeId,
        trigger,
        recipients,
        show_send_to_buyer: showSendToBuyer,
        subject,
        body,
        status: 1,
      },
    })

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        id: email_rule_setting.id,
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
