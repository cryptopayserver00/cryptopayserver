import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { CRYPTOPRICE } from '@/packages/web3/crypto_price'

export default async function handle(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const ids = req.query.ids
    if (!ids) {
      return res.status(200).json({ message: 'Invalid ids', result: false, data: null })
    }

    const currency = req.query.currency
    if (!currency) {
      return res.status(200).json({ message: 'Invalid currency', result: false, data: null })
    }

    const result = await CRYPTOPRICE.getCryptoPriceByCoinGecko(String(ids), String(currency))

    return res.status(200).json({ message: '', result: true, data: result })
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      message: 'Internal server error',
      result: false,
      data: null,
    })
  }
}
