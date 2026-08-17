import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { ORDER_STATUS, ORDER_TIME } from '@/packages/constants'
import { FindTokenByChainIdsAndSymbol } from '@/utils/web3'
import { WEB3 } from '@/packages/web3'
import { COINS } from '@/packages/constants/blockchain'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const orderId = req.query.order_id
    const orderStatus = req.query.order_status
    const time = req.query.time

    const storeId = Number(req.query.store_id)
    if (!storeId) {
      return res.status(200).json({ message: 'Invalid storeId', result: false, data: null })
    }

    const network = Number(req.query.network)
    if (!network) {
      return res.status(200).json({ message: 'Invalid network', result: false, data: null })
    }

    let whereData: { [key: string]: any } = {}
    whereData.store_id = storeId
    whereData.network = network
    whereData.status = 1

    if (orderId && Number(orderId)) whereData.order_id = orderId
    if (orderStatus && orderStatus !== ORDER_STATUS.AllStatus) whereData.order_status = orderStatus

    const date = new Date()
    switch (time) {
      case ORDER_TIME.AllTime:
        break
      case ORDER_TIME.Last24Hours:
        date.setHours(date.getHours() - 24)
        whereData.created_at = {
          gte: date,
        }
        break
      case ORDER_TIME.Last3Days:
        date.setHours(date.getHours() - 24 * 3)
        whereData.created_at = {
          gte: date,
        }
        break
      case ORDER_TIME.Last7Days:
        date.setHours(date.getHours() - 24 * 7)
        whereData.created_at = {
          gte: date,
        }
        break
    }

    let invoices = await prisma.invoices.findMany({
      where: whereData,
      orderBy: {
        id: 'desc',
      },
    })

    return res.status(200).json({
      message: '',
      result: true,
      data: invoices.map((item) => ({
        userId: item.user_id,
        storeId: item.store_id,
        chainId: item.chain_id,
        network: item.network,
        orderId: item.order_id,
        currency: item.currency,
        amount: item.amount,
        crypto: item.crypto,
        cryptoAmount: item.crypto_amount.toFixed(
          FindTokenByChainIdsAndSymbol(
            WEB3.getChainIds(item.network === 1, item.chain_id),
            item.crypto as COINS
          ).decimals
        ),
        rate: item.rate,
        lightningInvoice: item.lightning_invoice,
        lightningUrl: item.lightning_url,
        description: item.description,
        buyerEmail: item.buyer_email,
        orderStatus: item.order_status,
        paymentMethod: item.payment_method,
        destinationAddress: item.destination_address,
        paid: item.paid,
        metadata: item.metadata,
        notificationUrl: item.notification_url,
        notificationEmail: item.notification_email,
        matchTxId: item.match_tx_id,
        externalPaymentId: item.external_payment_id,
        sourceType: item.source_type,
        status: item.status,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        expirationAt: item.expiration_at,
        hash: item.hash,
        fromAddress: item.from_address,
        toAddress: item.to_address,
        blockTimestamp: item.block_timestamp,
      })),
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
