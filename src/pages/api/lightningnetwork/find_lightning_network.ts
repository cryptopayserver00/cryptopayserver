import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { LIGHTNINGNAME } from '@/packages/constants/blockchain'
import { LNDHUB } from '@/packages/lightning/core/lndhub'
import { LIGHTNING } from '@/packages/lightning'
import { prisma } from '@/lib/prisma'
import {
  rateLimit,
  assertStoreOwnedByUser,
  forbidden,
  requireAuthUserId,
} from '@/lib/auth'
import {
  encryptLightningCredentials,
  unwrapLightningCredentials,
} from '@/lib/crypto/lightning'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const userId = await requireAuthUserId(req, res, req.query.user_id)
    if (!userId) return

    if (!(await rateLimit(req, res, { scope: 'rl-find_lightning_network', limit: 120, windowMs: 15 * 60 * 1000 }))) {
      return
    }

    const storeId = Number(req.query.store_id)
    if (!storeId) {
      return res.status(200).json({ message: 'Invalid storeId', result: false, data: null })
    }

    if (!(await assertStoreOwnedByUser(storeId, userId))) {
      return forbidden(res)
    }

    const network = Number(req.query.network)
    if (!network) {
      return res.status(200).json({ message: 'Invalid network', result: false, data: null })
    }

    const find_lightning_network = await prisma.wallet_lightning_networks.findMany({
      where: {
        user_id: userId,
        store_id: storeId,
        status: 1,
      },
    })

    let datas: any[] = []

    if (find_lightning_network.length > 0) {
      for (const item of find_lightning_network) {
        let find_lightning_network_setting =
          await prisma.wallet_lightning_network_settings.findFirst({
            where: {
              lnd_id: item.id,
            },
          })
        if (!find_lightning_network_setting) {
          find_lightning_network_setting = await prisma.wallet_lightning_network_settings.create({
            data: {
              lnd_id: item.id,
              user_id: item.user_id,
              store_id: item.store_id,
              show_amount_satoshis: 2,
              show_hop_hint: 2,
              show_unify_url_and_qrcode: 2,
              show_lnurl: 1,
              show_lnurl_classic_mode: 1,
              show_allow_payee_pass_comment: 1,
              status: 1,
            },
          })
        }

        const creds = unwrapLightningCredentials(item)
        if (Object.keys(creds.upgrades).length > 0) {
          await prisma.wallet_lightning_networks.update({
            where: { id: item.id },
            data: creds.upgrades,
          })
        }

        let balance = 0
        switch (item.kind) {
          case LIGHTNINGNAME.BLINK:
            break
          case LIGHTNINGNAME.CLIGHTNING:
            balance = await LIGHTNING.getBalance(
              LIGHTNINGNAME.CLIGHTNING,
              item.server,
              '',
              '',
              '',
              creds.rune
            )
            break
          case LIGHTNINGNAME.LNBITS:
            break
          case LIGHTNINGNAME.LND:
            balance = await LIGHTNING.getBalance(
              LIGHTNINGNAME.LND,
              item.server,
              '',
              creds.macaroon,
              creds.certthumbprint
            )
            break
          case LIGHTNINGNAME.LNDHUB: {
            let access_token = creds.accessToken
            if (new Date().getTime() > LNDHUB.accessTokenMaxAge + item.updated_at.getTime()) {
              const [isAuthorized, data] = await LIGHTNING.testConnection(
                LIGHTNINGNAME.LNDHUB,
                item.server
              )
              if (!isAuthorized) {
                break
              }
              const sealedTokens = encryptLightningCredentials({
                access_token: data.accessToken,
                refresh_token: data.refreshToken,
              })
              const result = await prisma.wallet_lightning_networks.updateMany({
                data: {
                  access_token: sealedTokens.access_token,
                  refresh_token: sealedTokens.refresh_token,
                },
                where: {
                  id: item.id,
                  status: 1,
                },
              })
              if (result.count === 0) {
                break
              }
              access_token = String(data.accessToken || '')
            }

            balance = await LIGHTNING.getBalance(LIGHTNINGNAME.LNDHUB, item.server, access_token)
            break
          }
          case LIGHTNINGNAME.OPENNODE:
            break
          default:
            break
        }

        // Never return raw LN credentials to the browser.
        datas.push({
          id: item.id,
          userId: item.user_id,
          storeId: item.store_id,
          status: item.status,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          kind: item.kind,
          server: item.server,
          enabled: item.enabled,
          balance: balance,
          text: `type=${String(item.kind).toLowerCase()};server=${item.server};`,
          hasCredentials: Boolean(
            creds.macaroon || creds.rune || creds.accessToken || creds.certthumbprint
          ),
          showAmountSatoshis: find_lightning_network_setting.show_amount_satoshis,
          showHopHint: find_lightning_network_setting.show_hop_hint,
          showUnifyUrlAndQrcode: find_lightning_network_setting.show_unify_url_and_qrcode,
          showLnurl: find_lightning_network_setting.show_lnurl,
          showLnurlClassicMode: find_lightning_network_setting.show_lnurl_classic_mode,
          showAllowPayeePassComment: find_lightning_network_setting.show_allow_payee_pass_comment,
        })
      }
    }

    return res.status(200).json({ message: '', result: true, data: datas })
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      message: 'Internal server error',
      result: false,
      data: null,
    })
  }
}
