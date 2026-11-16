import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import {
  forbidden,
  getStoreAccess,
  requireAuthUserId,
  STORE_PERMISSION,
  storeAccessHasPermission,
} from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const userId = await requireAuthUserId(req, res, req.query.user_id)
    if (!userId) return

    const id = Number(req.query.id)
    if (!id) {
      return res.status(200).json({ message: 'Invalid id', result: false, data: null })
    }

    const payout_setting = await prisma.payout_settings.findFirst({
      where: {
        id: id,
        status: 1,
      },
    })

    if (!payout_setting) {
      return forbidden(res)
    }

    const access = await getStoreAccess(payout_setting.store_id, userId)
    if (!access || !storeAccessHasPermission(access, STORE_PERMISSION.ViewStores)) {
      return forbidden(res)
    }

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        id: payout_setting.id,
        userId: payout_setting.user_id,
        storeId: payout_setting.store_id,
        chainId: payout_setting.chain_id,
        network: payout_setting.network,
        status: payout_setting.status,
        showApprovePayoutProcess: payout_setting.show_approve_payout_process,
        interval: payout_setting.interval,
        feeBlockTarget: payout_setting.fee_block_target,
        threshold: payout_setting.threshold,
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
