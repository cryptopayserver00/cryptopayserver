import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import {
  assertWalletOwnedByUser,
  forbidden,
  hashPassword,
  requireAuth,
  validatePasswordStrength,
  verifyPassword,
} from '@/lib/auth'

export default async function handle(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.PUT) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const session = await requireAuth(req, res)
    if (!session) return

    const walletId = Number(req.body.wallet_id)
    if (!walletId) {
      return res.status(200).json({ message: 'Invalid walletId', result: false, data: null })
    }

    if (!(await assertWalletOwnedByUser(walletId, session.userId))) {
      return forbidden(res)
    }

    const wallet = await prisma.wallets.findFirst({
      where: { id: walletId, user_id: session.userId, status: 1 },
      select: { id: true, password: true, is_backup: true },
    })
    if (!wallet) {
      return forbidden(res)
    }

    const nextPassword = String(req.body.password ?? '')
    const oldPassword = String(req.body.old_password ?? '')

    // Changing an existing wallet password requires the current wallet password.
    if (wallet.password) {
      if (!oldPassword) {
        return res.status(200).json({
          message: 'Current wallet password required',
          result: false,
          data: null,
        })
      }
      const { ok } = await verifyPassword(oldPassword, wallet.password)
      if (!ok) {
        return res.status(200).json({
          message: 'Invalid current wallet password',
          result: false,
          data: null,
        })
      }
    } else {
      // First-time set: require account password so a stolen session cannot arm the wallet alone.
      const accountPassword = String(req.body.account_password || '')
      if (!accountPassword) {
        return res.status(200).json({
          message: 'Account password required to set wallet password',
          result: false,
          data: null,
        })
      }
      const user = await prisma.users.findFirst({
        where: { id: session.userId, status: 1 },
        select: { password: true },
      })
      if (!user) {
        return forbidden(res)
      }
      const { ok } = await verifyPassword(accountPassword, user.password)
      if (!ok) {
        return res.status(200).json({
          message: 'Invalid account password',
          result: false,
          data: null,
        })
      }
    }

    // Clearing wallet passwords is no longer allowed — session theft would unlock funds.
    if (!nextPassword) {
      return res.status(200).json({
        message: 'Wallet password cannot be removed',
        result: false,
        data: null,
      })
    }

    const passwordError = validatePasswordStrength(nextPassword)
    if (passwordError) {
      return res.status(200).json({ message: passwordError, result: false, data: null })
    }

    const cryptoPassword = await hashPassword(nextPassword)
    const updated = await prisma.wallets.update({
      data: { password: cryptoPassword },
      where: {
        id: wallet.id,
        user_id: session.userId,
        status: 1,
      },
    })

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        isBackup: updated.is_backup,
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
