import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import CryptoJS from 'crypto-js'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.PUT) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const email = req.body.email
    if (!email) {
      return res.status(200).json({ message: 'Invalid email', result: false, data: null })
    }

    const oldPwd = req.body.old_password
    if (!oldPwd) {
      return res.status(200).json({ message: 'Invalid oldPwd', result: false, data: null })
    }

    const newPwd = req.body.new_password
    if (!newPwd) {
      return res.status(200).json({ message: 'Invalid newPwd', result: false, data: null })
    }

    const oldCryptoPassword = CryptoJS.SHA256(oldPwd).toString()
    const newCryptoPassword = CryptoJS.SHA256(newPwd).toString()

    await prisma.users.update({
      data: {
        password: newCryptoPassword,
      },
      where: {
        email: email,
        password: oldCryptoPassword,
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
