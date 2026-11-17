import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { assertSameOrigin, clearPending2faCookie, clearSessionCookie, rateLimit } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    if (!assertSameOrigin(req, res)) return

    if (!(await rateLimit(req, res, { scope: 'logout', limit: 30, windowMs: 15 * 60 * 1000 }))) {
      return
    }

    clearSessionCookie(res)
    clearPending2faCookie(res)
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
