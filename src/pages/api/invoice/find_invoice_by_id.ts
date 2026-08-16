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

    const id = Number(req.query.id)
    if (!id) {
      return res.status(200).json({ message: 'Invalid id', result: false, data: null })
    }

    let invoice = await prisma.invoices.findFirst({
      where: {
        order_id: id,
        status: 1,
      },
    })

    if (!invoice) {
      return res.status(200).json({ message: 'Invalid invoice', result: false, data: null })
    }

    const token = FindTokenByChainIdsAndSymbol(
      WEB3.getChainIds(invoice.network === 1, invoice.chain_id),
      invoice.crypto as COINS
    )

    const store = await prisma.stores.findFirst({
      where: {
        id: invoice.store_id,
        status: 1,
      },
    })

    if (!store) {
      return res.status(200).json({ message: 'Invalid store', result: false, data: null })
    }

    const cryptoAmount = invoice.crypto_amount.toFixed(token.decimals)

    const qrCodeText = WEB3.generateQRCodeText(
      invoice.network === 1,
      invoice.chain_id,
      invoice.destination_address,
      token.contractAddress,
      cryptoAmount
    )

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        userId: invoice.user_id,
        storeId: invoice.store_id,
        chainId: invoice.chain_id,
        network: invoice.network,
        orderId: invoice.order_id,
        currency: invoice.currency,
        amount: invoice.amount,
        crypto: invoice.crypto,
        cryptoAmount: cryptoAmount,
        rate: invoice.rate,
        lightningInvoice: invoice.lightning_invoice,
        lightningUrl: invoice.lightning_url,
        description: invoice.description,
        buyerEmail: invoice.buyer_email,
        orderStatus: invoice.order_status,
        paymentMethod: invoice.payment_method,
        destinationAddress: invoice.destination_address,
        paid: invoice.paid,
        metadata: invoice.metadata,
        notificationUrl: invoice.notification_url,
        notificationEmail: invoice.notification_email,
        matchTxId: invoice.match_tx_id,
        externalPaymentId: invoice.external_payment_id,
        sourceType: invoice.source_type,
        status: invoice.status,
        createdAt: invoice.created_at,
        updatedAt: invoice.updated_at,
        expirationAt: invoice.expiration_at,
        hash: invoice.hash,
        fromAddress: invoice.from_address,
        toAddress: invoice.to_address,
        blockTimestamp: invoice.block_timestamp,
        qrLightningCodeText: invoice.lightning_invoice
          ? `lightning:${invoice.lightning_invoice?.toUpperCase()}`
          : undefined,
        qrCodeText: qrCodeText,
        storeName: store.name,
        storeBrandColor: store.brand_color,
        storeLogoUrl: store.logo_url,
        storeWebsite: store.website,
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
