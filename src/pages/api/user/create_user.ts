import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import CryptoJS from 'crypto-js'
import { prisma } from '@/lib/prisma'

export default async function handle(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const email = req.body.email
    if (!email) {
      return res.status(200).json({ message: 'Invalid email', result: false, data: null })
    }

    const password = req.body.password
    if (!password) {
      return res.status(200).json({ message: 'Invalid password', result: false, data: null })
    }

    const username = req.body.username
    const cryptoPassword = CryptoJS.SHA256(password).toString()

    await prisma.users.create({
      data: {
        email: email,
        username: username ? username : "",
        password: cryptoPassword,
        profile_picture_url: '',
        authenticator: '',
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
