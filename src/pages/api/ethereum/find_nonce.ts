import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { WEB3 } from '@/packages/web3'
import { assertAddressOwnedByUser, rateLimit, requireAuth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const session = await requireAuth(req, res)
    if (!session) return

    if (!(await rateLimit(req, res, { scope: 'rpc-proxy', limit: 120, windowMs: 15 * 60 * 1000 }))) {
      return
    }

    const address = req.query.address

    const chainId = Number(req.query.chain_id)
    if (!chainId) {
      return res.status(200).json({ message: 'Invalid chainId', result: false, data: null })
    }

    const network = Number(req.query.network)
    if (!network) {
      return res.status(200).json({ message: 'Invalid network', result: false, data: null })
    }

    if (!address) {
      return res.status(200).json({ message: 'Invalid address', result: false, data: null })
    }

    if (
      !(await assertAddressOwnedByUser(String(address), session.userId, {
        chainId,
        network,
      }))
    ) {
      return res.status(200).json({ message: 'Address not owned', result: false, data: null })
    }

    const nonce = await WEB3.getNonce(network === 1, chainId, String(address))

    return res.status(200).json({ message: '', result: true, data: nonce })
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      message: 'Internal server error',
      result: false,
      data: null,
    })
  }
}
