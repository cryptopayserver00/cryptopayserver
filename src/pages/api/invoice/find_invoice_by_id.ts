import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { WEB3 } from '@/packages/web3'
import { FindTokenByChainIdsAndSymbol } from '@/utils/web3'
import { COINS } from '@/packages/constants/blockchain'
import { prisma } from '@/lib/prisma'
import {
  getSessionFromRequest,
  getStoreAccess,
  rateLimit,
  STORE_PERMISSION,
  storeAccessHasPermission,
} from '@/lib/auth'
import { readAccessToken, verifyPublicResource } from '@/lib/security/public-token'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    if (!rateLimit(req, res, { scope: 'pub-find-invoice-by-id', limit: 60, windowMs: 15 * 60 * 1000 })) {
      return
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

    const tokenOk = verifyPublicResource('invoice', id, readAccessToken(req))
    if (!tokenOk) {
      const session = await getSessionFromRequest(req)
      const access =
        session && (await getStoreAccess(invoice.store_id, session.userId))
      const owns =
        access &&
        (storeAccessHasPermission(access, STORE_PERMISSION.ViewStores) ||
          storeAccessHasPermission(access, STORE_PERMISSION.ModifyInvoices))
      if (!owns) {
        return res
          .status(403)
          .json({ message: 'Invalid or missing access token', result: false, data: null })
      }
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

    // Public checkout payload — no buyer PII; chain tx details only after settlement.
    const settled = String(invoice.order_status).toLowerCase().includes('settled') ||
      String(invoice.order_status).toLowerCase().includes('complete') ||
      invoice.paid === 1

    return res.status(200).json({
      message: '',
      result: true,
      data: {
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
        orderStatus: invoice.order_status,
        paymentMethod: invoice.payment_method,
        destinationAddress: invoice.destination_address,
        paid: invoice.paid,
        sourceType: invoice.source_type,
        status: invoice.status,
        createdAt: invoice.created_at,
        updatedAt: invoice.updated_at,
        expirationAt: invoice.expiration_at,
        hash: settled ? invoice.hash : undefined,
        fromAddress: settled ? invoice.from_address : undefined,
        toAddress: settled ? invoice.to_address : undefined,
        blockTimestamp: settled ? invoice.block_timestamp : undefined,
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
