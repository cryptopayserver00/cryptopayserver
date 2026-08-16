import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { LIGHTNINGNAME } from '@/packages/constants/blockchain'
import { LIGHTNING } from '@/packages/lightning'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }
    const text = req.query.text
    if (!text) {
      return res.status(200).json({ message: 'Invalid text', result: false, data: null })
    }

    const values: Record<string, string> = {}
    String(text)
      .split(';')
      .filter((line) => line.trim() !== '')
      .forEach((line) => {
        const [key, ...valueParts] = line.split('=')
        if (key && valueParts.length > 0) {
          values[key] = valueParts.join('=')
        }
      })

    if (!values || !values['type'] || !values['server']) {
      return res.status(200).json({ message: 'Invalid values', result: false, data: null })
    }

    const type = values['type'].toUpperCase()
    const server = values['server']
    const macaroon = values['macaroon']
    const certthumbprint = values['certthumbprint']
    const rune = values['rune']

    if (!Object.values(LIGHTNINGNAME).includes(type as LIGHTNINGNAME)) {
      return res.status(200).json({ message: 'Invalid lightning name', result: false, data: null })
    }

    const [isAuthorized, _] = await LIGHTNING.testConnection(
      type as LIGHTNINGNAME,
      server,
      macaroon,
      certthumbprint,
      rune
    )

    if (!isAuthorized) {
      return res.status(200).json({ message: 'Invalid authorized', result: false, data: null })
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
