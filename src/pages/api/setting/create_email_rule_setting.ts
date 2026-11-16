import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import { requireStorePermission, STORE_PERMISSION } from '@/lib/auth'

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
    const userId = access.userId
    const storeId = access.storeId

    const trigger = req.body.trigger
    const recipients = req.body.recipients
    const showSendToBuyer = req.body.show_send_to_buyer
    const subject = req.body.subject
    const body = req.body.body

    const email_rule_setting = await prisma.email_rule_settings.create({
      data: {
        user_id: userId,
        store_id: storeId,
        trigger: trigger,
        recipients: recipients,
        show_send_to_buyer: showSendToBuyer,
        subject: subject,
        body: body,
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
