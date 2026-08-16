import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { WEB3 } from '@/packages/web3'
import { FindTokenByChainIdsAndSymbol } from '@/utils/web3'
import { COINS } from '@/packages/constants/blockchain'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const userId = Number(req.query.user_id)
    if (!userId) {
      return res.status(200).json({ message: 'Invalid userId', result: false, data: null })
    }

    const chainId = Number(req.query.chain_id)
    if (!chainId) {
      return res.status(200).json({ message: 'Invalid chainId', result: false, data: null })
    }

    const network = Number(req.query.network)
    if (!network) {
      return res.status(200).json({ message: 'Invalid network', result: false, data: null })
    }

    const coin = req.query.coin
    const from = req.query.from
    let to = req.query.to
    let value = req.query.value

    if (!to) {
      return res.status(200).json({ message: 'Invalid to', result: false, data: null })
    }

    if (!value) {
      return res.status(200).json({ message: 'Invalid value', result: false, data: null })
    }

    if (!coin) {
      return res.status(200).json({ message: 'Invalid coin', result: false, data: null })
    }

    const address = await prisma.addresses.findFirst({
      where: {
        chain_id: chainId,
        network: network,
        address: String(from),
        user_id: userId,
        status: 1,
      },
      select: {
        chain_id: true,
        private_key: true,
        note: true,
        network: true,
        address: true,
      },
    })

    if (!address) {
      return res.status(200).json({ message: 'Cannot find address', result: false, data: '' })
    }

    const gas = await WEB3.estimateGasFee(address.network === 1, {
      coin: FindTokenByChainIdsAndSymbol(
        WEB3.getChainIds(address.network === 1, address.chain_id),
        coin as COINS
      ),
      value: String(value),
      privateKey: address.private_key,
      from: address.address,
      to: String(to),
    })

    if (!gas) {
      return res.status(200).json({ message: 'Cannot get gas', result: false, data: null })
    }

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
