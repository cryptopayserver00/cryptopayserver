import type { NextApiRequest, NextApiResponse } from 'next'
import { WEB3 } from '@/packages/web3'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { rateLimit, requireAccountPassword, requireAuth } from '@/lib/auth'
import { normalizePrivateKeyInput, validateImportPrivateKey } from '@/utils/verify'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const session = await requireAuth(req, res)
    if (!session) return

    if (!(await rateLimit(req, res, { scope: 'import-pk', limit: 20, windowMs: 15 * 60 * 1000 }))) {
      return
    }

    if (
      !(await requireAccountPassword(
        req,
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

    const privateKey = normalizePrivateKeyInput(String(req.body.private_key || ''))
    const validationError = validateImportPrivateKey(chainId, privateKey)
    if (validationError) {
      return res.status(200).json({ message: validationError, result: false, data: null })
    }

    let result
    try {
      result = await WEB3.createAccountByPrivateKey(network === 1, chainId, privateKey)
    } catch (e) {
      console.error(e)
      return res.status(200).json({
        message: 'Invalid private key for the selected chain',
        result: false,
        data: null,
      })
    }

    if (!result || result.length === 0) {
      return res.status(200).json({
        message: 'Cannot import wallet for this chain with the provided key',
        result: false,
        data: null,
      })
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
