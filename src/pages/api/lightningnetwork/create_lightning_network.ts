import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { LIGHTNING } from '@/packages/lightning'
import { LIGHTNINGNAME } from '@/packages/constants/blockchain'
import { prisma } from '@/lib/prisma'
import {
  assertStoreOwnedByUser,
  forbidden,
  rateLimit,
  requireAccountPassword,
  requireAuthUserId,
} from '@/lib/auth'
import { encryptLightningCredentials } from '@/lib/crypto/lightning'
import { assertSafeHttpUrl } from '@/lib/security/safe-url'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const userId = await requireAuthUserId(req, res, req.body.user_id)
    if (!userId) return

    if (!(await rateLimit(req, res, { scope: 'ln-create', limit: 20, windowMs: 15 * 60 * 1000 }))) {
      return
    }

    if (
      !(await requireAccountPassword(
        req,
        res,
        userId,
        req.body.account_password || req.body.password,
        'Account password required to save Lightning credentials'
      ))
    ) {
      return
    }

    const storeId = Number(req.body.store_id)
    if (!storeId) {
      return res.status(200).json({ message: 'Invalid storeId', result: false, data: null })
    }
    if (!(await assertStoreOwnedByUser(storeId, userId))) {
      return forbidden(res)
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

    const serverUrl = /^https?:\/\//i.test(server) ? server : `https://${server}`
    const safeServer = await assertSafeHttpUrl(serverUrl, { allowHttp: true })
    if (!safeServer.ok) {
      return res.status(200).json({ message: safeServer.message, result: false, data: null })
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
    const sealed = encryptLightningCredentials({
      macaroon,
      certthumbprint,
      rune,
      access_token: data.accessToken,
      refresh_token: data.refreshToken,
    })

    if (find_wallet_lightning_network) {
      // update one
      const result = await prisma.wallet_lightning_networks.updateMany({
        data: {
          kind: type,
          server: server,
          macaroon: sealed.macaroon || undefined,
          certthumbprint: sealed.certthumbprint || undefined,
          rune: sealed.rune || undefined,
          access_token: sealed.access_token || undefined,
          refresh_token: sealed.refresh_token || undefined,
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
        access_token: sealed.access_token || undefined,
        refresh_token: sealed.refresh_token || undefined,
        certthumbprint: sealed.certthumbprint || undefined,
        macaroon: sealed.macaroon || undefined,
        rune: sealed.rune || undefined,
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
