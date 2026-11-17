import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { GenerateOrderIDByTime } from '@/utils/number'
import { INVOICE_SOURCE_TYPE, ORDER_STATUS, PAYMENT_REQUEST_STATUS } from '@/packages/constants'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/auth'
import { resolveAndValidateInvoicePrice } from '@/lib/security/invoice-price'
import {
  readAccessToken,
  signPublicResource,
  verifyPublicResource,
} from '@/lib/security/public-token'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    if (!(await rateLimit(req, res, { scope: 'ext-invoice', limit: 30, windowMs: 15 * 60 * 1000 }))) {
      return
    }

    const externalPaymentId = Number(req.body.payment_request_id)
    if (!externalPaymentId) {
      return res
        .status(200)
        .json({ message: 'Invalid externalPaymentId', result: false, data: null })
    }

    if (!verifyPublicResource('payment_request', externalPaymentId, readAccessToken(req))) {
      return res
        .status(403)
        .json({ message: 'Invalid or missing access token', result: false, data: null })
    }

    // Never trust client-supplied user_id / store_id — derive from payment request.
    const paymentRequest = await prisma.payment_requests.findFirst({
      where: {
        payment_request_id: externalPaymentId,
        status: 1,
      },
      select: {
        user_id: true,
        store_id: true,
        network: true,
        amount: true,
        currency: true,
        email: true,
        payment_request_status: true,
        show_allow_custom_amount: true,
        expiration_at: true,
      },
    })

    if (!paymentRequest) {
      return res.status(200).json({ message: 'Invalid payment request', result: false, data: null })
    }

    if (
      paymentRequest.expiration_at &&
      new Date(paymentRequest.expiration_at).getTime() < Date.now()
    ) {
      return res.status(200).json({ message: 'Payment request expired', result: false, data: null })
    }

    if (paymentRequest.payment_request_status !== PAYMENT_REQUEST_STATUS.Pending) {
      return res
        .status(200)
        .json({ message: 'Payment request not open', result: false, data: null })
    }

    const userId = paymentRequest.user_id
    const storeId = paymentRequest.store_id

    const store = await prisma.stores.findFirst({
      where: { id: storeId, status: 1 },
      select: { id: true },
    })
    if (!store) {
      return res.status(200).json({ message: 'Store unavailable', result: false, data: null })
    }

    const chainId = Number(req.body.chain_id)
    if (!chainId) {
      return res.status(200).json({ message: 'Invalid chainId', result: false, data: null })
    }

    const network = Number(req.body.network)
    if (!network || network !== paymentRequest.network) {
      return res.status(200).json({ message: 'Invalid network', result: false, data: null })
    }

    const amount = Number(req.body.amount)
    if (!amount || amount <= 0) {
      return res.status(200).json({ message: 'Invalid amount', result: false, data: null })
    }
    const allowCustom = paymentRequest.show_allow_custom_amount === 1
    const expectedAmount = Number(paymentRequest.amount)
    if (
      !allowCustom &&
      (!Number.isFinite(expectedAmount) ||
        Math.abs(amount - expectedAmount) > Math.max(1e-8, Math.abs(expectedAmount) * 1e-9))
    ) {
      return res.status(200).json({ message: 'Invalid amount', result: false, data: null })
    }

    let crypto_amount = Number(req.body.crypto_amount)
    if (!crypto_amount) {
      return res.status(200).json({ message: 'Invalid crypto amount', result: false, data: null })
    }

    let rate = Number(req.body.rate)
    if (!rate) {
      return res.status(200).json({ message: 'Invalid rate', result: false, data: null })
    }

    const currency = String(req.body.currency || '')
    if (!currency || currency !== paymentRequest.currency) {
      return res.status(200).json({ message: 'Invalid currency', result: false, data: null })
    }

    const crypto = req.body.crypto
    if (!crypto) {
      return res.status(200).json({ message: 'Invalid crypto', result: false, data: null })
    }

    const priced = await resolveAndValidateInvoicePrice({
      crypto: String(crypto),
      currency,
      amount,
      clientRate: rate,
      clientCryptoAmount: crypto_amount,
    })
    if (!priced.ok) {
      return res.status(200).json({ message: priced.message, result: false, data: null })
    }
    rate = priced.rate
    crypto_amount = priced.cryptoAmount

    const email = String(req.body.email || paymentRequest.email || '')
    if (!email) {
      return res.status(200).json({ message: 'Invalid email', result: false, data: null })
    }

    const orderId = GenerateOrderIDByTime()

    const payment_setting = await prisma.payment_settings.findFirst({
      where: {
        user_id: userId,
        store_id: storeId,
        chain_id: chainId,
        network: network,
        status: 1,
      },
      select: {
        current_used_address_id: true,
        payment_expire: true,
      },
    })

    if (!payment_setting) {
      return res.status(200).json({
        message: 'Invalid payment setting',
        result: false,
        data: null,
      })
    }

    const address = await prisma.addresses.findFirst({
      where: {
        id: payment_setting.current_used_address_id,
        user_id: userId,
        status: 1,
      },
      select: {
        address: true,
      },
    })

    if (!address) {
      return res.status(200).json({
        message: 'Invalid address',
        result: false,
        data: null,
      })
    }

    const paid = 2 // unpaid
    const orderStatus = ORDER_STATUS.Processing

    const now = new Date()
    const expirationDate = new Date(
      now.setMinutes(now.getMinutes() + payment_setting.payment_expire)
    )

    const sourceType = INVOICE_SOURCE_TYPE.PaymentRequest

    const invoice = await prisma.invoices.create({
      data: {
        user_id: userId,
        store_id: storeId,
        chain_id: chainId,
        network: network,
        order_id: orderId,
        external_payment_id: externalPaymentId,
        source_type: sourceType,
        amount: amount,
        crypto: crypto,
        crypto_amount: crypto_amount,
        currency: currency,
        rate: rate,
        description: null,
        buyer_email: null,
        destination_address: address.address,
        paid: paid,
        metadata: null,
        notification_url: null,
        notification_email: email,
        order_status: orderStatus,
        expiration_at: expirationDate,
        status: 1,
      },
    })

    if (!invoice) {
      return res.status(200).json({
        message: 'Invalid invoice',
        result: false,
        data: null,
      })
    }

    await prisma.invoice_events.createMany({
      data: [
        {
          invoice_id: invoice.id,
          order_id: orderId,
          message: 'Creation of invoice starting',
          status: 1,
        },
        {
          invoice_id: invoice.id,
          order_id: orderId,
          message: `${crypto}_${currency}: The rating rule is coingecko(${crypto}_${currency})`,
          status: 1,
        },
        {
          invoice_id: invoice.id,
          order_id: orderId,
          message: `${crypto}_${currency}: The evaluated rating rule is ${rate}`,
          status: 1,
        },
        {
          invoice_id: invoice.id,
          order_id: orderId,
          message: `Invoice ${orderId} new event: invoice_created`,
          status: 1,
        },
      ],
    })

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        orderId: orderId,
        accessToken: signPublicResource('invoice', orderId),
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
