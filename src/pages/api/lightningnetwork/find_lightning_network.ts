import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { LIGHTNINGNAME } from '@/packages/constants/blockchain'
import { LNDHUB } from '@/packages/lightning/core/lndhub'
import { LIGHTNING } from '@/packages/lightning'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const userId = Number(req.query.user_id)
    if (!userId) {
      return res.status(200).json({ message: 'Invalid userId', result: false, data: null })
    }

    const storeId = Number(req.query.store_id)
    if (!storeId) {
      return res.status(200).json({ message: 'Invalid storeId', result: false, data: null })
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

    if (!find_lightning_network) {
      return res
        .status(200)
        .json({ message: 'Invalid find lightning network', result: false, data: null })
    }

    let datas: any[] = []

    if (find_lightning_network.length > 0) {
      for (const item of find_lightning_network) {
        let text = ''
        const find_lightning_network_setting =
          await prisma.wallet_lightning_network_settings.findFirst({
            where: {
              lnd_id: item.id,
            },
          })
        if (!find_lightning_network_setting) {
          return res
            .status(200)
            .json({ message: 'Invalid find lightning network setting', result: false, data: null })
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
              String(item.rune)
            )
            text = `type=${item.kind.toLowerCase()};server=${item.server};rune=${item.rune};`
            break
          case LIGHTNINGNAME.LNBITS:
            break
          case LIGHTNINGNAME.LND:
            balance = await LIGHTNING.getBalance(
              LIGHTNINGNAME.LND,
              item.server,
              '',
              String(item.macaroon),
              String(item.certthumbprint)
            )
            text = `type=${item.kind.toLowerCase()};server=${item.server};macaroon=${
              item.macaroon
            };certthumbprint=${item.certthumbprint}`
            break
          case LIGHTNINGNAME.LNDHUB:
            let access_token = ''
            if (new Date().getTime() > LNDHUB.accessTokenMaxAge + item.updated_at.getTime()) {
              // expired
              const [isAuthorized, data] = await LIGHTNING.testConnection(
                LIGHTNINGNAME.LNDHUB,
                item.server
              )
              if (!isAuthorized) {
                break
              }
              const result = await prisma.wallet_lightning_networks.updateMany({
                data: {
                  access_token: data.accessToken,
                  refresh_token: data.refreshToken,
                },
                where: {
                  id: item.id,
                  status: 1,
                },
              })
              if (result.count === 0) {
                break
              }

              access_token = data.access_token
            } else {
              access_token = String(item.access_token)
            }

            balance = await LIGHTNING.getBalance(LIGHTNINGNAME.LNDHUB, item.server, access_token)
            text = `type=${item.kind.toLowerCase()};server=${item.server};`
            break
          case LIGHTNINGNAME.OPENNODE:
            break
          default:
            break
        }

        datas.push({
          id: item.id,
          userId: item.user_id,
          storeId: item.store_id,
          status: item.status,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          kind: item.kind,
          server: item.server,
          accessToken: item.access_token,
          refreshToken: item.refresh_token,
          macaroon: item.macaroon,
          certthumbprint: item.certthumbprint,
          rune: item.rune,
          enabled: item.enabled,
          balance: balance,
          text: text,
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
