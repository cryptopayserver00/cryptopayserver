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

    const network = Number(req.body.network)
    if (!network) {
      return res.status(200).json({ message: 'Invalid network', result: false, data: null })
    }

    const label = req.body.label
    if (!label) {
      return res.status(200).json({ message: 'Invalid label', result: false, data: null })
    }

    const message = req.body.message
    if (!message) {
      return res.status(200).json({ message: 'Invalid message', result: false, data: null })
    }

    const url = req.body.url
    if (!url) {
      return res.status(200).json({ message: 'Invalid url', result: false, data: null })
    }

    const isSeen = 2

    const notification = await prisma.notifications.create({
      data: {
        user_id: userId,
        store_id: storeId,
        network: network,
        label: label,
        message: message,
        url: url,
        is_seen: isSeen,
        status: 1,
      },
    })

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        id: notification.id,
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
