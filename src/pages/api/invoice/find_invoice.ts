import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import { requireStorePermission, STORE_PERMISSION } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const access = await requireStorePermission(
      req,
      res,
      req.query.store_id,
      STORE_PERMISSION.ModifyInvoices,
      req.query.user_id
    )
    if (!access) return

    const invoices = await prisma.invoices.findMany({
      where: {
        store_id: access.storeId,
        user_id: access.userId,
        status: 1,
      },
      orderBy: {
        updated_at: 'desc',
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
        cryptoAmount: item.crypto_amount,
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
