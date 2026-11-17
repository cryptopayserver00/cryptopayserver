import type { NextApiRequest, NextApiResponse } from 'next'
import type { ResponseData } from '@/pages/api'
import { verifyPassword, hashPassword } from './password'
import { prisma } from '@/lib/prisma'
import { rateLimit } from './rate-limit'

/**
 * Require a wallet password for sensitive actions (export / send / trust line).
 * Wallets without a password must set one first — empty password is no longer allowed.
 */
export async function requireWalletPasswordIfSet(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  wallet: { id: number; password: string | null },
  walletPasswordRaw: unknown
): Promise<boolean> {
  if (
    !(await rateLimit(req, res, {
      scope: `wallet-pwd-gate:${wallet.id}`,
      limit: 20,
      windowMs: 15 * 60 * 1000,
    }))
  ) {
    return false
  }

  if (!wallet.password) {
    res.status(403).json({
      message: 'Set a wallet password before this action',
      result: false,
      data: null,
    })
    return false
  }

  const walletPassword = String(walletPasswordRaw || '')
  if (!walletPassword) {
    res.status(403).json({
      message: 'Wallet password required',
      result: false,
      data: null,
    })
    return false
  }

  const { ok, needsRehash } = await verifyPassword(walletPassword, wallet.password)
  if (!ok) {
    res.status(403).json({
      message: 'Invalid wallet password',
      result: false,
      data: null,
    })
    return false
  }

  if (needsRehash) {
    const next = await hashPassword(walletPassword)
    await prisma.wallets.update({
      where: { id: wallet.id },
      data: { password: next },
    })
  }

  return true
}
