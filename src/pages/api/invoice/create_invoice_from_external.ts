import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { GenerateOrderIDByTime } from '@/utils/number'
import { INVOICE_SOURCE_TYPE, ORDER_STATUS } from '@/packages/constants'
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

    const externalPaymentId = Number(req.body.payment_request_id)
    if (!externalPaymentId) {
      return res
        .status(200)
        .json({ message: 'Invalid externalPaymentId', result: false, data: null })
    }

    const chainId = Number(req.body.chain_id)
    if (!chainId) {
      return res.status(200).json({ message: 'Invalid chainId', result: false, data: null })
    }

    const network = Number(req.body.network)
    if (!network) {
      return res.status(200).json({ message: 'Invalid network', result: false, data: null })
    }

    const amount = Number(req.body.amount)
    if (!amount) {
      return res.status(200).json({ message: 'Invalid amount', result: false, data: null })
    }

    const crypto_amount = Number(req.body.crypto_amount)
    if (!crypto_amount) {
      return res.status(200).json({ message: 'Invalid crypto amount', result: false, data: null })
    }

    const rate = Number(req.body.rate)
    if (!rate) {
      return res.status(200).json({ message: 'Invalid rate', result: false, data: null })
    }

    const currency = req.body.currency
    if (!currency) {
      return res.status(200).json({ message: 'Invalid currency', result: false, data: null })
    }

    const crypto = req.body.crypto
    if (!crypto) {
      return res.status(200).json({ message: 'Invalid crypto', result: false, data: null })
    }

    const email = req.body.email
    if (!email) {
      return res.status(200).json({ message: 'Invalid email', result: false, data: null })
    }

    const orderId = GenerateOrderIDByTime()

    const payment_setting = await prisma.payment_settings.findFirst({
      where: {
        user_id: userId,
        store_id: storeId,
        chain_id: chainId,
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
    const orderStatus = ORDER_STATUS.Processing // settled, invalid, expired, processing

    const now = new Date()
    // const createDate = now.getTime();
    const expirationDate = new Date(
      now.setMinutes(now.getMinutes() + payment_setting.payment_expire)
    )
    // const expirationDate = now.getTime() + payment_setting.payment_expire * 60 * 1000;

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

    // create event of invoice
    const invoice_events = await prisma.invoice_events.createMany({
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
