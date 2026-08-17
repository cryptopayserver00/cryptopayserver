import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { BtcToMsatoshis, BtcToSatoshis, GenerateOrderIDByTime } from '@/utils/number'
import { INVOICE_SOURCE_TYPE, NOTIFICATION_TYPE, ORDER_STATUS } from '@/packages/constants'
import { CHAINS, LIGHTNINGNAME } from '@/packages/constants/blockchain'
import { LIGHTNING } from '@/packages/lightning'
import { LNDHUB } from '@/packages/lightning/core/lndhub'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const currency = req.body.currency
    const crypto = req.body.crypto
    const description = req.body.description
    const buyerEmail = req.body.buyer_email
    const metadata = req.body.metadata
    const notificationUrl = req.body.notification_url
    const notificationEmail = req.body.notification_email
    const showBtcLn = req.body.show_btc_ln
    const showBtcUrl = req.body.show_btc_url

    const userId = Number(req.body.user_id)
    if (!userId) {
      return res.status(200).json({ message: 'Invalid userId', result: false, data: null })
    }

    const storeId = Number(req.body.store_id)
    if (!storeId) {
      return res.status(200).json({ message: 'Invalid storeId', result: false, data: null })
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

    if (!currency) {
      return res.status(200).json({ message: 'Invalid currency', result: false, data: null })
    }

    if (!crypto) {
      return res.status(200).json({ message: 'Invalid crypto', result: false, data: null })
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
    const expirationDate = new Date(
      now.setMinutes(now.getMinutes() + payment_setting.payment_expire)
    )
    // const expirationDate = now.getTime() + parseInt(paymentExpire) * 60 * 1000;
    const sourceType = INVOICE_SOURCE_TYPE.Invoice

    // handle lightning network
    let lightningInvoice = '',
      lightningUrl = ''
    if (chainId === CHAINS.BITCOIN) {
      const find_lightning_network = await prisma.wallet_lightning_networks.findFirst({
        where: {
          user_id: userId,
          store_id: storeId,
          enabled: 1,
          status: 1,
        },
      })

      if (find_lightning_network) {
        if (showBtcLn === 1) {
          const lndDescription = `Pay invoice (Order ID: ${orderId})`
          switch (find_lightning_network.kind) {
            case LIGHTNINGNAME.BLINK:
              break
            case LIGHTNINGNAME.CLIGHTNING:
              lightningInvoice = await LIGHTNING.addInvoice(
                LIGHTNINGNAME.CLIGHTNING,
                find_lightning_network.server,
                BtcToMsatoshis(crypto_amount),
                lndDescription,
                '',
                '',
                '',
                '',
                String(find_lightning_network.rune)
              )
              break
            case LIGHTNINGNAME.LNBITS:
              break
            case LIGHTNINGNAME.LND:
              lightningInvoice = await LIGHTNING.addInvoice(
                LIGHTNINGNAME.LND,
                find_lightning_network.server,
                BtcToMsatoshis(crypto_amount),
                lndDescription,
                '',
                '',
                String(find_lightning_network.macaroon),
                String(find_lightning_network.certthumbprint)
              )
              break
            case LIGHTNINGNAME.LNDHUB:
              let access_token = ''
              if (
                new Date().getTime() >
                LNDHUB.accessTokenMaxAge + find_lightning_network.updated_at.getTime()
              ) {
                // expired
                const [isAuthorized, data] = await LIGHTNING.testConnection(
                  LIGHTNINGNAME.LNDHUB,
                  find_lightning_network.server
                )
                if (!isAuthorized) {
                  return res
                    .status(200)
                    .json({ message: 'Invalid authorized', result: false, data: null })
                }
                const result = await prisma.wallet_lightning_networks.updateMany({
                  data: {
                    access_token: data.accessToken,
                    refresh_token: data.refreshToken,
                  },
                  where: {
                    id: find_lightning_network.id,
                    status: 1,
                  },
                })

                if (result.count === 0) {
                  return res
                    .status(200)
                    .json({ message: 'Cannot update', result: false, data: null })
                }

                access_token = data.access_token
              } else {
                access_token = String(find_lightning_network.access_token)
              }

              lightningInvoice = await LIGHTNING.addInvoice(
                LIGHTNINGNAME.LNDHUB,
                find_lightning_network.server,
                BtcToSatoshis(Number(crypto_amount)),
                lndDescription,
                '',
                access_token
              )
              break
            case LIGHTNINGNAME.OPENNODE:
              break
            default:
              break
          }

          if (!lightningInvoice || lightningInvoice === '') {
            return res
              .status(200)
              .json({ message: 'Invalid lightning invoice', result: false, data: null })
          }
        }

        if (showBtcUrl === 1) {
        }
      }
    }

    const invoice = await prisma.invoices.create({
      data: {
        user_id: userId,
        store_id: storeId,
        chain_id: chainId,
        network: network,
        order_id: orderId,
        source_type: sourceType,
        amount: amount,
        crypto: crypto,
        crypto_amount: crypto_amount,
        currency: currency,
        rate: rate,
        lightning_invoice: lightningInvoice,
        lightning_url: lightningUrl,
        description: description,
        buyer_email: buyerEmail,
        destination_address: address.address,
        paid: paid,
        metadata: metadata,
        notification_url: notificationUrl,
        notification_email: notificationEmail,
        order_status: orderStatus,
        expiration_at: expirationDate,
        external_payment_id: 0,
        status: 1,
      },
    })

    // create event of invoice
    const result = await prisma.invoice_events.createMany({
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

    if (result.count === 0) {
      return res.status(200).json({
        message: 'Invalid create',
        result: false,
        data: null,
      })
    }

    // create notification
    await prisma.notifications.create({
      data: {
        user_id: userId,
        store_id: storeId,
        network: network,
        label: NOTIFICATION_TYPE.Invoice,
        message: `You have a new invoice in progress: ${orderId}`,
        url: `/payments/invoices/${orderId}`,
        is_seen: 2,
        status: 1,
      },
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
