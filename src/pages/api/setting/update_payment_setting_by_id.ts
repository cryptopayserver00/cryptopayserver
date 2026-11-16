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

export default async function handle(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
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
    const owned = await prisma.payment_settings.findFirst({
      where: { id, status: 1 },
      select: { id: true, store_id: true },
    })
    if (!owned) {
      return forbidden(res)
    }

    const access = await getStoreAccess(owned.store_id, session.userId)
    if (!access || !storeAccessHasPermission(access, STORE_PERMISSION.ModifyStores)) {
      return forbidden(res, 'Insufficient store permission')
    }

    let updateData: { [key: string]: any } = {}

    if (req.body.payment_expire) updateData.payment_expire = Number(req.body.payment_expire)
    if (req.body.confirm_block) updateData.confirm_block = Number(req.body.confirm_block)
    if (req.body.show_recommended_fee)
      updateData.show_recommended_fee = Number(req.body.show_recommended_fee)
    if (req.body.current_used_address_id) {
      const addressId = Number(req.body.current_used_address_id)
      if (!addressId) {
        return res.status(200).json({ message: 'Invalid address id', result: false, data: null })
      }
      const address = await prisma.addresses.findFirst({
        where: { id: addressId, user_id: access.ownerUserId, status: 1 },
        select: { id: true },
      })
      if (!address) {
        return forbidden(res, 'Address not owned by store')
      }
      updateData.current_used_address_id = addressId
    }

    await prisma.payment_settings.update({
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
