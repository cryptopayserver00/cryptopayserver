import type { NextApiRequest, NextApiResponse } from 'next'
import { WEB3 } from '@/packages/web3'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { BLOCKSCAN } from '@/packages/web3/block_scan'
import { assertAddressOwnedByUser, rateLimit, requireAuth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    // POST — mutating faucet must not be CSRF-able via GET + cookies.
    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const session = await requireAuth(req, res)
    if (!session) return

    if (!(await rateLimit(req, res, { scope: 'free-coin', limit: 5, windowMs: 60 * 60 * 1000 }))) {
      return
    }

    const chainId = Number(req.body.chain_id)
    if (!chainId) {
      return res.status(200).json({ message: 'Invalid chainId', result: false, data: null })
    }

    const network = Number(req.body.network)
    if (network !== 2) {
      return res.status(200).json({ message: 'Faucet only available on testnet', result: false, data: null })
    }

    const amount = req.body.amount
    const coin = req.body.coin
    const address = req.body.address

    if (!amount || !coin || !address) {
      return res.status(200).json({
        message: 'Missing required params: amount, coin, address',
        result: false,
        data: null,
      })
    }

    if (
      !(await assertAddressOwnedByUser(String(address), session.userId, {
        chainId,
        network,
      }))
    ) {
      return res.status(200).json({
        message: 'Address must belong to your wallet',
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
