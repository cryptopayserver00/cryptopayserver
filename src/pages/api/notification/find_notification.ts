import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }
    let findData: { [key: string]: any } = {}

    if (req.query.store_id) findData.store_id = Number(req.query.store_id)
    if (req.query.is_seen) findData.is_seen = Number(req.query.is_seen)
    if (req.query.network) findData.network = Number(req.query.network)
    findData.status = 1

    const notifications = await prisma.notifications.findMany({
      where: findData,
      orderBy: {
        id: 'desc',
      },
    })

    return res.status(200).json({
      message: '',
      result: true,
      data: notifications.map((item) => ({
        id: item.id,
        userId: item.user_id,
        storeId: item.store_id,
        isSeen: item.is_seen,
        network: item.network,
        status: item.status,
        label: item.label,
        message: item.message,
        url: item.url,
        updatedAt: item.updated_at,
        createdAt: item.created_at,
      })),
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
