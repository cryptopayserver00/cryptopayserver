import type { NextApiRequest, NextApiResponse } from 'next'
import { CHAINS } from '@/packages/constants/blockchain'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { NOTIFICATION, NOTIFICATIONS } from '@/packages/constants'
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

    const name = req.body.name
    if (!name) {
      return res.status(200).json({ message: 'Invalid name', result: false, data: null })
    }

    const currency = req.body.currency
    if (!currency) {
      return res.status(200).json({ message: 'Invalid currency', result: false, data: null })
    }

    const priceSource = req.body.price_source
    if (!priceSource) {
      return res.status(200).json({ message: 'Invalid priceSource', result: false, data: null })
    }

    const website = req.body.website
    if (!website) {
      return res.status(200).json({ message: 'Invalid website', result: false, data: null })
    }

    const brandColor = '#000000'

    const store = await prisma.stores.create({
      data: {
        user_id: userId,
        name: name,
        currency: currency,
        price_source: priceSource,
        brand_color: brandColor,
        website: website,
        logo_url: '',
        custom_css_url: '',
        allow_anyone_create_invoice: 1,
        add_additional_fee_to_invoice: 1,
        invoice_expires_if_not_paid_full_amount: 1,
        invoice_paid_less_than_precent: 10,
        minimum_expiraion_time_for_refund: 10,
        status: 1,
      },
    })

    // create notification setting
    const ids: number[] = NOTIFICATIONS.map((item: NOTIFICATION) => item.id)

    await prisma.notification_settings.create({
      data: {
        user_id: userId,
        store_id: store.id,
        notifications: ids.join(','),
        status: 1,
      },
    })

    // create payment setting for blockchain
    const chainValues = Object.values(CHAINS)
    const filteredChainValues = chainValues.filter((value) => typeof value === 'number')
    for (const chain of filteredChainValues) {
      const result = await prisma.payment_settings.createMany({
        data:
          chain === CHAINS.ARBITRUMNOVA
            ? [
                {
                  user_id: userId,
                  chain_id: chain,
                  network: 1,
                  store_id: store.id,
                  payment_expire: 30,
                  confirm_block: 1,
                  show_recommended_fee: 1,
                  current_used_address_id: 0,
                  status: 1,
                },
              ]
            : [
                {
                  user_id: userId,
                  chain_id: chain,
                  network: 1,
                  store_id: store.id,
                  payment_expire: 30,
                  confirm_block: 1,
                  show_recommended_fee: 1,
                  current_used_address_id: 0,
                  status: 1,
                },
                {
                  user_id: userId,
                  chain_id: chain,
                  network: 2,
                  store_id: store.id,
                  payment_expire: 30,
                  confirm_block: 1,
                  show_recommended_fee: 1,
                  current_used_address_id: 0,
                  status: 1,
                },
              ],
      })

      if (result.count === 0) {
        return res.status(200).json({ message: 'Cannot updatemany', result: false, data: null })
      }
    }

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        id: store.id,
        name: store.name,
        currency: store.currency,
        priceSource: store.price_source,
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
