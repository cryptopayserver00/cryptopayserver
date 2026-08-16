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

    if (req.body.show_approve_payout_process !== undefined)
      updateData.show_approve_payout_process = Number(req.body.show_approve_payout_process)
    if (req.body.interval !== undefined) updateData.interval = Number(req.body.interval)
    if (req.body.fee_block_target !== undefined)
      updateData.fee_block_target = Number(req.body.fee_block_target)
    if (req.body.threshold !== undefined) updateData.threshold = Number(req.body.threshold)

    await prisma.payout_settings.update({
      data: updateData,
      where: {
        id: id,
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
