import type { NextApiRequest, NextApiResponse } from 'next'
import { LIGHTNINGNAME } from '@/packages/constants/blockchain'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { LNDHUB } from '@/packages/lightning/core/lndhub'
import { LIGHTNING } from '@/packages/lightning'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const id = Number(req.body.lightning_id)
    if (!id) {
      return res.status(200).json({ message: 'Invalid id', result: false, data: null })
    }

    const invoice = req.body.invoice
    if (!invoice) {
      return res.status(200).json({ message: 'Invalid invoice', result: false, data: null })
    }

    const find_lightning_network = await prisma.wallet_lightning_networks.findFirst({
      where: {
        id: id,
        status: 1,
      },
    })

    if (!find_lightning_network) {
      return res
        .status(200)
        .json({ message: 'Invalid find lightning network', result: false, data: null })
    }

    let isPay = false

    switch (find_lightning_network.kind) {
      case LIGHTNINGNAME.BLINK:
        break
      case LIGHTNINGNAME.CLIGHTNING:
        isPay = await LIGHTNING.payInvoice(
          LIGHTNINGNAME.CLIGHTNING,
          find_lightning_network.server,
          invoice,
          '',
          '',
          '',
          String(find_lightning_network.rune)
        )
        break
      case LIGHTNINGNAME.LNBITS:
        break
      case LIGHTNINGNAME.LND:
        isPay = await LIGHTNING.payInvoice(
          LIGHTNINGNAME.LND,
          find_lightning_network.server,
          invoice,
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
          await prisma.wallet_lightning_networks.update({
            data: {
              access_token: data.accessToken,
              refresh_token: data.refreshToken,
            },
            where: {
              id: find_lightning_network.id,
              status: 1,
            },
          })

          access_token = data.access_token
        } else {
          access_token = String(find_lightning_network.access_token)
        }

        isPay = await LIGHTNING.payInvoice(
          LIGHTNINGNAME.LNDHUB,
          find_lightning_network.server,
          invoice,
          access_token
        )
        break
      case LIGHTNINGNAME.OPENNODE:
        break
      default:
        break
    }

    if (!isPay) {
      return res.status(200).json({ message: 'Cannot pay', result: false, data: null })
    }

    return res.status(200).json({ message: '', result: true, data: null })
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      message: 'Internal server error',
      result: false,
      data: null,
    })
  }
}
