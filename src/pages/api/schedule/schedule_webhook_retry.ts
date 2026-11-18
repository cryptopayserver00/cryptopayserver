import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { requireCronSecret, withCronLock } from '@/lib/auth'
import { WEBHOOK } from '@/utils/webhook'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    if (!requireCronSecret(req, res)) return

    const locked = await withCronLock('schedule_webhook_retry', 55_000, async () => {
      console.info('Schedule Webhook Retry')
      return WEBHOOK.retryDueDeliveries(50)
    })

    if (!locked.acquired) {
      return res.status(200).json({ message: 'skipped: lock held', result: true, data: null })
    }

    return res.status(200).json({
      message: '',
      result: true,
      data: locked.result,
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
