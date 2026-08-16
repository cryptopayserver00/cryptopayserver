import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

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
      return res
        .status(200)
        .json({ message: 'Cannot find payout setting', result: false, data: null })
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
        createdAt: payout_setting.created_at,
        updatedAt: payout_setting.updated_at,
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
