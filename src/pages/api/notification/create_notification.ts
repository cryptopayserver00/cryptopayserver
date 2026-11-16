import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import { requireStorePermission, STORE_PERMISSION } from '@/lib/auth'
import { assertSafeHttpUrl } from '@/lib/security/safe-url'

function isSafeNotificationUrl(raw: string): boolean {
  const url = String(raw || '').trim()
  if (!url) return false
  // Relative app paths only (no scheme / protocol-relative).
  if (url.startsWith('/') && !url.startsWith('//')) {
    if (url.toLowerCase().startsWith('/\\') || url.includes('://')) return false
    return true
  }
  return false
}

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

    let url = String(req.body.url || '').trim()
    if (!url) {
      return res.status(200).json({ message: 'Invalid url', result: false, data: null })
    }

    if (!isSafeNotificationUrl(url)) {
      const safe = await assertSafeHttpUrl(url)
      if (!safe.ok) {
        return res.status(200).json({
          message: 'Notification url must be a relative path or https URL',
          result: false,
          data: null,
        })
      }
      url = safe.url.toString()
    }

    const isSeen = 2

    const notification = await prisma.notifications.create({
      data: {
        user_id: userId,
        store_id: storeId,
        network: network,
        label: String(label).slice(0, 200),
        message: String(message).slice(0, 2000),
        url: url.slice(0, 2000),
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
