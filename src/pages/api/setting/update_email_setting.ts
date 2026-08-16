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

    if (req.body.smtp_server !== undefined) updateData.smtp_server = req.body.smtp_server
    if (req.body.port !== undefined) updateData.port = Number(req.body.port)
    if (req.body.sender_email !== undefined) updateData.sender_email = req.body.sender_email
    if (req.body.login !== undefined) updateData.login = req.body.login
    if (req.body.password !== undefined) updateData.password = req.body.password
    if (req.body.show_tls !== undefined) updateData.show_tls = Number(req.body.show_tls)

    await prisma.email_settings.update({
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
