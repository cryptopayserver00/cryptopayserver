import type { NextApiRequest, NextApiResponse } from 'next'
import { LIGHTNINGNAME } from '@/packages/constants/blockchain'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { LNDHUB } from '@/packages/lightning/core/lndhub'
import { LIGHTNING } from '@/packages/lightning'
import { prisma } from '@/lib/prisma'
import {
  assertLightningOwnedByUser,
  forbidden,
  rateLimit,
  requireAccountPassword,
  requireAuth,
} from '@/lib/auth'
import {
  encryptLightningCredentials,
  unwrapLightningCredentials,
} from '@/lib/crypto/lightning'
import { assertSafeHttpUrl } from '@/lib/security/safe-url'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const session = await requireAuth(req, res)
    if (!session) return

    if (!rateLimit(req, res, { scope: 'ln-send', limit: 30, windowMs: 15 * 60 * 1000 })) {
      return
    }

    const id = Number(req.body.lightning_id)
    if (!id) {
      return res.status(200).json({ message: 'Invalid id', result: false, data: null })
    }

    if (!(await assertLightningOwnedByUser(id, session.userId))) {
      return forbidden(res)
    }

    if (
      !(await requireAccountPassword(
        res,
        session.userId,
        req.body.account_password || req.body.password,
        'Account password required to send Lightning payment'
      ))
    ) {
      return
    }

    const invoice = req.body.invoice
    if (!invoice) {
      return res.status(200).json({ message: 'Invalid invoice', result: false, data: null })
    }

    const find_lightning_network = await prisma.wallet_lightning_networks.findFirst({
      where: {
        id: id,
        user_id: session.userId,
        status: 1,
      },
    })

    if (!find_lightning_network) {
      return res
        .status(200)
        .json({ message: 'Invalid find lightning network', result: false, data: null })
    }

    const serverUrl = /^https?:\/\//i.test(find_lightning_network.server)
      ? find_lightning_network.server
      : `https://${find_lightning_network.server}`
    const safeServer = await assertSafeHttpUrl(serverUrl, { allowHttp: true })
    if (!safeServer.ok) {
      return res.status(200).json({ message: safeServer.message, result: false, data: null })
    }

    const creds = unwrapLightningCredentials(find_lightning_network)
    if (Object.keys(creds.upgrades).length > 0) {
      await prisma.wallet_lightning_networks.update({
        where: { id: find_lightning_network.id },
        data: creds.upgrades,
      })
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
          creds.rune
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
          creds.macaroon,
          creds.certthumbprint
        )
        break
      case LIGHTNINGNAME.LNDHUB: {
        let access_token = creds.accessToken
        if (
          new Date().getTime() >
          LNDHUB.accessTokenMaxAge + find_lightning_network.updated_at.getTime()
        ) {
          const [isAuthorized, data] = await LIGHTNING.testConnection(
            LIGHTNINGNAME.LNDHUB,
            find_lightning_network.server
          )
          if (!isAuthorized) {
            return res
              .status(200)
              .json({ message: 'Invalid authorized', result: false, data: null })
          }
          const sealedTokens = encryptLightningCredentials({
            access_token: data.accessToken,
            refresh_token: data.refreshToken,
          })
          await prisma.wallet_lightning_networks.update({
            data: {
              access_token: sealedTokens.access_token,
              refresh_token: sealedTokens.refresh_token,
            },
            where: {
              id: find_lightning_network.id,
              status: 1,
            },
          })

          access_token = String(data.accessToken || '')
        }

        isPay = await LIGHTNING.payInvoice(
          LIGHTNINGNAME.LNDHUB,
          find_lightning_network.server,
          invoice,
          access_token
        )
        break
      }
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
