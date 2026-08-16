import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { WEB3 } from '@/packages/web3'
import { FindTokenByChainIdsAndSymbol } from '@/utils/web3'
import { COINS } from '@/packages/constants/blockchain'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const from = req.query.from
    const to = req.query.to
    const value = req.query.value
    const coin = req.query.coin

    const chainId = Number(req.query.chain_id)
    if (!chainId) {
      return res.status(200).json({ message: 'Invalid chainId', result: false, data: null })
    }

    const network = Number(req.query.network)
    if (!network) {
      return res.status(200).json({ message: 'Invalid network', result: false, data: null })
    }

    if (!from) {
      return res.status(200).json({ message: 'Invalid from', result: false, data: null })
    }

    if (!to) {
      return res.status(200).json({ message: 'Invalid to', result: false, data: null })
    }

    if (!value) {
      return res.status(200).json({ message: 'Invalid value', result: false, data: null })
    }

    if (!coin) {
      return res.status(200).json({ message: 'Invalid coin', result: false, data: null })
    }

    const token = FindTokenByChainIdsAndSymbol(
      WEB3.getChainIds(network === 1, Number(chainId)),
      coin as COINS
    )

    const gas = await WEB3.getGasLimit(
      network === 1,
      chainId,
      String(token.contractAddress),
      String(from),
      String(to),
      String(value)
    )

    return res.status(200).json({ message: '', result: true, data: gas })
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      message: 'Internal server error',
      result: false,
      data: null,
    })
  }
}
