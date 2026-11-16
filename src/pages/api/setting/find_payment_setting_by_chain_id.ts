import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import { requireStorePermission, STORE_PERMISSION } from '@/lib/auth'

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
    const { userId, storeId } = access

    const chainId = Number(req.query.chain_id)
    if (!chainId) {
      return res.status(200).json({ message: 'Invalid chainId', result: false, data: null })
    }

    const network = Number(req.query.network)
    if (!network) {
      return res.status(200).json({ message: 'Invalid network', result: false, data: null })
    }

    const payment_setting = await prisma.payment_settings.findFirst({
      where: {
        user_id: userId,
        store_id: storeId,
        chain_id: chainId,
        network: network,
        status: 1,
      },
    })

    if (!payment_setting) {
      return res.status(200).json({ message: 'Invalid payment setting', result: false, data: null })
    }

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        id: payment_setting.id,
        paymentExpire: payment_setting.payment_expire,
        confirmBlock: payment_setting.confirm_block,
        showRecommendedFee: payment_setting.show_recommended_fee,
        currentUsedAddressId: payment_setting.current_used_address_id,
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
