import type { NextApiRequest, NextApiResponse } from 'next'
import { WEB3 } from '@/packages/web3'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { GetSecureRandomString } from '@/utils/strings'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const userId = Number(req.body.user_id)
    if (!userId) {
      return res.status(200).json({ message: 'Invalid userId', result: false, data: null })
    }

    const storeId = Number(req.body.store_id)
    if (!storeId) {
      return res.status(200).json({ message: 'Invalid storeId', result: false, data: null })
    }

    const importWallet = req.body.import_wallet
    if (!importWallet) {
      return res.status(200).json({ message: 'Invalid importWallet', result: false, data: null })
    }

    const walletAccount = await WEB3.generateWallet(importWallet)
    const name = GetSecureRandomString(12)

    const wallet = await prisma.wallets.create({
      data: {
        user_id: userId,
        store_id: storeId,
        name: name,
        mnemonic: walletAccount.mnemonic,
        is_backup: 2,
        is_generate: walletAccount.isGenerate ? 1 : 2,
        password: '',
        status: 1,
      },
    })

    if (!walletAccount.account?.length) {
      return res.status(200).json({ message: 'Cannot generate wallet', result: false, data: null })
    }

    for (const account of walletAccount.account) {
      await prisma.addresses.create({
        data: {
          user_id: userId,
          wallet_id: wallet.id,
          address: account.address,
          chain_id: account.chain,
          private_key: account.privateKey ? account.privateKey : '',
          note: account.note ? account.note : '',
          network: account.isMainnet ? 1 : 2,
          status: 1,
        },
      })
    }

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        walletId: wallet.id,
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
