import type { NextApiRequest, NextApiResponse } from 'next'
import { WEB3 } from '@/packages/web3'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { rateLimit, requireAccountPassword, requireAuth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const session = await requireAuth(req, res)
    if (!session) return

    if (!rateLimit(req, res, { scope: 'import-pk', limit: 20, windowMs: 15 * 60 * 1000 })) {
      return
    }

    if (
      !(await requireAccountPassword(
        res,
        session.userId,
        req.body.account_password || req.body.password,
        'Account password required to import private key'
      ))
    ) {
      return
    }

    const chainId = Number(req.body.chain_id)
    if (!chainId) {
      return res.status(200).json({ message: 'Invalid chainId', result: false, data: null })
    }

    const network = Number(req.body.network)
    if (!network) {
      return res.status(200).json({ message: 'Invalid network', result: false, data: null })
    }

    const privateKey = req.body.private_key
    if (!privateKey) {
      return res.status(200).json({ message: 'Invalid privateKey', result: false, data: null })
    }

    const result = await WEB3.createAccountByPrivateKey(network === 1, chainId, privateKey)

    if (result.length === 0) {
      return res.status(200).json({ message: 'Cannot save wallet', result: false, data: null })
    }

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
