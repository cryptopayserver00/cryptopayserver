import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { LIGHTNING } from '@/packages/lightning'
import { LIGHTNINGNAME } from '@/packages/constants/blockchain'
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

    const network = Number(req.body.network)
    if (!network) {
      return res.status(200).json({ message: 'Invalid network', result: false, data: null })
    }

    const text = req.body.text
    if (!text) {
      return res.status(200).json({ message: 'Invalid text', result: false, data: null })
    }

    const values: Record<string, string> = {}
    String(text)
      .split(';')
      .filter((line) => line.trim() !== '')
      .forEach((line) => {
        const [key, ...valueParts] = line.split('=')
        if (key && valueParts.length > 0) {
          values[key] = valueParts.join('=')
        }
      })

    if (!values || !values['type'] || !values['server']) {
      return res.status(200).json({ message: 'Invalid value', result: false, data: null })
    }

    const type = values['type'].toUpperCase()
    const server = values['server']
    const macaroon = values['macaroon']
    const certthumbprint = values['certthumbprint']
    const rune = values['rune']

    if (!Object.values(LIGHTNINGNAME).includes(type as LIGHTNINGNAME)) {
      return res.status(200).json({ message: 'Invalid lightning name', result: false, data: null })
    }

    const [isAuthorized, data] = await LIGHTNING.testConnection(
      type as LIGHTNINGNAME,
      server,
      macaroon,
      certthumbprint,
      rune
    )
    if (!isAuthorized) {
      return res.status(200).json({ message: 'Invalid authorized', result: false, data: null })
    }

    const find_wallet_lightning_network = await prisma.wallet_lightning_networks.findFirst({
      where: {
        user_id: userId,
        store_id: storeId,
        status: 1,
      },
    })
    if (find_wallet_lightning_network) {
      // update one
      const result = await prisma.wallet_lightning_networks.updateMany({
        data: {
          kind: type,
          server: server,
          macaroon: macaroon ? macaroon : undefined,
          certthumbprint: certthumbprint ? certthumbprint : undefined,
          rune: rune ? rune : undefined,
        },
        where: {
          id: find_wallet_lightning_network.id,
          status: 1,
        },
      })

      if (result.count === 0) {
        return res.status(200).json({ message: 'Invalid update', result: false, data: null })
      }

      return res.status(200).json({ message: '', result: true, data: null })
    }

    // create one
    const wallet_lightning_network = await prisma.wallet_lightning_networks.create({
      data: {
        user_id: userId,
        store_id: storeId,
        kind: type,
        server: server,
        access_token: data.accessToken ? data.accessToken : undefined,
        refresh_token: data.refreshToken ? data.refreshToken : undefined,
        certthumbprint: certthumbprint ? certthumbprint : undefined,
        macaroon: macaroon ? macaroon : undefined,
        rune: rune ? rune : undefined,
        enabled: 1,
        status: 1,
      },
    })

    await prisma.wallet_lightning_network_settings.create({
      data: {
        lnd_id: wallet_lightning_network.id,
        user_id: userId,
        store_id: storeId,
        show_amount_satoshis: 2,
        show_hop_hint: 2,
        show_unify_url_and_qrcode: 2,
        show_lnurl: 1,
        show_lnurl_classic_mode: 1,
        show_allow_payee_pass_comment: 1,
        status: 1,
      },
    })

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
