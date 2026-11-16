import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import {
  forbidden,
  getStoreAccess,
  requireAuth,
  STORE_PERMISSION,
  storeAccessHasPermission,
} from '@/lib/auth'
import { encryptSecret } from '@/lib/crypto/secrets'
import { assertSafeHttpUrl } from '@/lib/security/safe-url'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.PUT) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const session = await requireAuth(req, res)
    if (!session) return

    const id = Number(req.body.id)
    if (!id) {
      return res.status(200).json({ message: 'Invalid id', result: false, data: null })
    }
    const owned = await prisma.webhook_settings.findFirst({
      where: { id, status: 1 },
      select: { id: true, store_id: true, user_id: true },
    })
    if (!owned) {
      return forbidden(res)
    }

    const access = await getStoreAccess(owned.store_id, session.userId)
    if (!access || !storeAccessHasPermission(access, STORE_PERMISSION.ModifyWebhooks)) {
      return forbidden(res, 'Insufficient store permission')
    }

    let updateData: { [key: string]: any } = {}

    if (req.body.payload_url) {
      const safeUrl = await assertSafeHttpUrl(String(req.body.payload_url))
      if (!safeUrl.ok) {
        return res.status(200).json({ message: safeUrl.message, result: false, data: null })
      }
      updateData.payload_url = safeUrl.url.toString()
    }
    const nextSecret = String(req.body.secret || '')
    if (nextSecret && !nextSecret.startsWith('•')) {
      updateData.secret = encryptSecret(nextSecret)
    }
    if (req.body.automatic_redelivery)
      updateData.automatic_redelivery = Number(req.body.automatic_redelivery)
    if (req.body.enabled) updateData.enabled = Number(req.body.enabled)
    if (req.body.event_type) updateData.event_type = Number(req.body.event_type)

    await prisma.webhook_settings.update({
      data: updateData,
      where: {
        id: owned.id,
        user_id: access.ownerUserId,
        status: 1,
      },
    })

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
