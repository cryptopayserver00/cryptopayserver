import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { CHAINS } from '@/packages/constants/blockchain'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const storeId = Number(req.query.store_id)
    if (!storeId) {
      return res.status(200).json({ message: 'Invalid storeId', result: false, data: null })
    }

    const userId = Number(req.query.user_id)
    if (!userId) {
      return res.status(200).json({ message: 'Invalid userId', result: false, data: null })
    }

    const network = Number(req.query.network)
    if (!network) {
      return res.status(200).json({ message: 'Invalid network', result: false, data: null })
    }

    const payout_setting = await prisma.payout_settings.findMany({
      where: {
        store_id: storeId,
        user_id: userId,
        status: 1,
      },
    })

    if (payout_setting.length === 0) {
      // create default role
      const chainValues = Object.values(CHAINS)
      const filteredChainValues = chainValues.filter((value) => typeof value === 'number')
      const data: any[] = []

      filteredChainValues.forEach(async (item) => {
        data.push({
          user_id: userId,
          store_id: storeId,
          chain_id: Number(item),
          network: network,
          show_approve_payout_process: 2,
          interval: 60,
          fee_block_target: 1,
          threshold: 0,
          status: 1,
        })
      })

      const result = await prisma.payout_settings.createMany({
        data: data,
      })

      if (result.count === 0) {
        return res.status(200).json({ message: 'Cannot create', result: false, data: null })
      }

      return res.status(200).json({ message: '', result: true, data: null })
    }

    return res.status(200).json({
      message: '',
      result: true,
      data: payout_setting.map((item) => ({
        id: item.id,
        storeId: item.store_id,
        userId: item.user_id,
        network: item.network,
        chainId: item.chain_id,
        status: item.status,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        showApprovePayoutProcess: item.show_approve_payout_process,
        interval: item.interval,
        feeBlockTarget: item.fee_block_target,
        threshold: item.threshold,
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
