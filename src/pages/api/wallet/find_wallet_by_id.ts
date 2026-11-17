import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import {
  forbidden,
  rateLimit,
  requireAccountPassword,
  requireAuth,
  requireWalletPasswordIfSet,
} from '@/lib/auth'
import { decryptAndUpgrade } from '@/lib/crypto/secrets'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET && req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const session = await requireAuth(req, res)
    if (!session) return

    const id = Number(req.method === HttpMethod.POST ? req.body.id : req.query.id)
    if (!id) {
      return res.status(200).json({ message: 'Invalid id', result: false, data: null })
    }

    const wallet = await prisma.wallets.findFirst({
      where: {
        id: id,
        user_id: session.userId,
        status: 1,
      },
    })

    if (!wallet) {
      return forbidden(res, 'Cannot find wallet')
    }

    const hasPassword = Boolean(wallet.password)
    const reveal =
      req.method === HttpMethod.POST &&
      (String(req.body.reveal || '') === '1' || req.body.reveal === true)

    // Metadata-only response (dashboard / manage) — never include mnemonic.
    if (!reveal) {
      return res.status(200).json({
        message: '',
        result: true,
        data: {
          name: wallet.name,
          hasPassword,
          isBackup: wallet.is_backup,
        },
      })
    }

    if (!(await rateLimit(req, res, { scope: 'export-mnemonic', limit: 10, windowMs: 15 * 60 * 1000 }))) {
      return
    }

    if (
      !(await requireAccountPassword(
        req,
        res,
        session.userId,
        req.body.account_password || req.body.password,
        'Account password required to reveal mnemonic'
      ))
    ) {
      return
    }

    // Password must be in POST body — never query string (logs / Referer).
    if (!(await requireWalletPasswordIfSet(req, res, wallet, req.body.wallet_password))) {
      return
    }

    const { plaintext, upgraded } = decryptAndUpgrade(wallet.mnemonic)
    if (upgraded) {
      await prisma.wallets.update({
        where: { id: wallet.id },
        data: { mnemonic: upgraded },
      })
    }

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        name: wallet.name,
        mnemonic: plaintext,
        hasPassword,
        isBackup: wallet.is_backup,
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
