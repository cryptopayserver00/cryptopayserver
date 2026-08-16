import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.PUT) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }
    const id = Number(req.body.id)
    if (!id) {
      return res.status(200).json({ message: 'Invalid id', result: false, data: null })
    }

    let updateData: { [key: string]: any } = {}

    if (req.body.show_amount_satoshis !== undefined)
      updateData.show_amount_satoshis = Number(req.body.show_amount_satoshis)
    if (req.body.show_hop_hint !== undefined)
      updateData.show_hop_hint = Number(req.body.show_hop_hint)
    if (req.body.show_unify_url_and_qrcode !== undefined)
      updateData.show_unify_url_and_qrcode = Number(req.body.show_unify_url_and_qrcode)
    if (req.body.show_lnurl !== undefined) updateData.show_lnurl = Number(req.body.show_lnurl)
    if (req.body.show_lnurl_classic_mode !== undefined)
      updateData.show_lnurl_classic_mode = Number(req.body.show_lnurl_classic_mode)
    if (req.body.show_allow_payee_pass_comment !== undefined)
      updateData.show_allow_payee_pass_comment = Number(req.body.show_allow_payee_pass_comment)

    const wallet_lightning_network = await prisma.wallet_lightning_networks.update({
      data: {
        enabled: req.body.enabled ? Number(req.body.enabled) : undefined,
      },
      where: {
        id: id,
        status: 1,
      },
    })

    const result = await prisma.wallet_lightning_network_settings.updateMany({
      data: updateData,
      where: {
        lnd_id: wallet_lightning_network.id,
        status: 1,
      },
    })

    if (result.count === 0) {
      return res.status(200).json({ message: 'Invalid update', result: false, data: null })
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
