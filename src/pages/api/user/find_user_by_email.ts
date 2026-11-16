import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { rateLimit } from '@/lib/auth'

/**
 * Intentionally does not reveal whether an email is registered (anti-enumeration).
 * Registration should rely on create_user uniqueness errors instead.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    if (!(await rateLimit(req, res, { scope: 'find-email', limit: 20, windowMs: 15 * 60 * 1000 }))) {
      return
    }

    const email = req.query.email
    if (!email) {
      return res.status(200).json({ message: 'Invalid email', result: false, data: null })
    }

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        exists: false,
      },
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
