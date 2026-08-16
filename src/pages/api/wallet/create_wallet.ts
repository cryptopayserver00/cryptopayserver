import type { NextApiRequest, NextApiResponse } from 'next'
import { WEB3 } from '@/packages/web3'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { GetSecureRandomString } from '@/utils/strings'
import { ETHEREUM_CATEGORY_CHAINS } from '@/packages/constants/blockchain'
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

    const walletAccount = await WEB3.generateWallet()
    const name = GetSecureRandomString(12)

    const wallet = await prisma.wallets.create({
      data: {
        user_id: userId,
        store_id: storeId,
        name: name,
        mnemonic: walletAccount.mnemonic,
        password: '',
        is_backup: 2,
        is_generate: walletAccount.isGenerate ? 1 : 2,
        status: 1,
      },
    })

    walletAccount.account &&
      walletAccount.account.length > 0 &&
      walletAccount.account.forEach(async (item) => {
        const address = await prisma.addresses.create({
          data: {
            user_id: userId,
            wallet_id: wallet.id,
            address: item.address,
            chain_id: item.chain,
            private_key: item.privateKey ? item.privateKey : '',
            note: item.note ? item.note : '',
            network: item.isMainnet ? 1 : 2,
            status: 1,
          },
        })

        if (ETHEREUM_CATEGORY_CHAINS.includes(address.chain_id)) {
          ETHEREUM_CATEGORY_CHAINS.map(async (item) => {
            const payment_setting = await prisma.payment_settings.findFirst({
              where: {
                chain_id: Number(item),
                network: address.network,
                store_id: storeId,
                status: 1,
              },
            })

            if (!payment_setting) {
              return res.status(200).json({ message: 'Cannot find', result: false, data: null })
            }

            await prisma.payment_settings.update({
              data: {
                current_used_address_id: address.id,
              },
              where: {
                id: payment_setting.id,
                status: 1,
              },
            })
          })
        } else {
          const payment_setting = await prisma.payment_settings.findFirst({
            where: {
              chain_id: address.chain_id,
              network: address.network,
              store_id: storeId,
              status: 1,
            },
          })

          if (!payment_setting) {
            return res.status(200).json({ message: 'Cannot find', result: false, data: null })
          }

          await prisma.payment_settings.update({
            data: {
              current_used_address_id: address.id,
            },
            where: {
              id: payment_setting.id,
              status: 1,
            },
          })
        }
      })

    return res.status(200).json({ message: '', result: true, data: { walletId: wallet.id } })
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      message: 'Internal server error',
      result: false,
      data: null,
    })
  }
}
