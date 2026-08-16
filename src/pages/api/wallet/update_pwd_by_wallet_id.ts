import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import CryptoJS from 'crypto-js'
import { prisma } from '@/lib/prisma'

export default async function handle(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.PUT) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const walletId = Number(req.body.wallet_id)
    if (!walletId) {
      return res.status(200).json({ message: 'Invalid walletId', result: false, data: null })
    }

    const password = req.body.password
    if (!password) {
      return res.status(200).json({ message: 'Invalid password', result: false, data: null })
    }

    const cryptoPassword = password ? CryptoJS.SHA256(password).toString() : password

    const wallet = await prisma.wallets.update({
      data: {
        password: cryptoPassword,
      },
      where: {
        id: walletId,
        status: 1,
      },
    })

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        isBackup: wallet.is_backup,
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
