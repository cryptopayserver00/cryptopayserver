import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { CHAINS } from '@/packages/constants/blockchain'
import { prisma } from '@/lib/prisma'
import { rateLimit, requireStorePermission, STORE_PERMISSION, storeAccessHasPermission } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const access = await requireStorePermission(
      req,
      res,
      req.query.store_id,
      STORE_PERMISSION.ViewStores,
      req.query.user_id
    )
    if (!access) return

    if (!(await rateLimit(req, res, { scope: 'rl-find_payout_setting', limit: 120, windowMs: 15 * 60 * 1000 }))) {
      return
    }
    const { userId, storeId } = access

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
      if (!storeAccessHasPermission(access, STORE_PERMISSION.ModifyStores)) {
        return res.status(200).json({ message: '', result: true, data: [] })
      }
      const chainValues = Object.values(CHAINS)
      const filteredChainValues = chainValues.filter((value) => typeof value === 'number')
      const data = filteredChainValues.map((item) => ({
        user_id: userId,
        store_id: storeId,
        chain_id: Number(item),
        network: network,
        show_approve_payout_process: 2,
        interval: 60,
        fee_block_target: 1,
        threshold: 0,
        status: 1,
      }))

      const result = await prisma.payout_settings.createMany({
        data: data,
      })

      if (result.count === 0) {
        return res.status(200).json({ message: 'Cannot create', result: false, data: null })
      }

      const seeded = await prisma.payout_settings.findMany({
        where: {
          store_id: storeId,
          user_id: userId,
          status: 1,
        },
      })

      return res.status(200).json({
        message: '',
        result: true,
        data: seeded.map((item) => ({
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
