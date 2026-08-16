import type { NextApiRequest, NextApiResponse } from 'next'
import { WEB3 } from '@/packages/web3'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { BLOCKSCAN } from '@/packages/web3/block_scan'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const chainId = Number(req.query.chain_id)
    if (!chainId) {
      return res.status(200).json({ message: 'Invalid chainId', result: false, data: null })
    }

    const amount = req.query.amount
    const coin = req.query.coin
    const address = req.query.address

    if (!amount || !coin || !address) {
      return res.status(200).json({
        message: 'Missing required params: amount, coin, address',
        result: false,
        data: null,
      })
    }

    const hash = await BLOCKSCAN.getFreeCoin(
      WEB3.getChainIds(false, chainId),
      String(address),
      String(coin),
      String(amount)
    )

    if (!hash) {
      return res.status(200).json({ message: 'Invalid hash', result: false, data: null })
    }

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        hash: hash,
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
