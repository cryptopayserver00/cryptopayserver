import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { CRON_HEADER_NAME } from './constants'
import { assertSameOrigin } from './csrf'
import {
  getStoreAccess,
  STORE_PERMISSION,
  storeAccessHasPermission,
  type StoreAccess,
} from './rbac'
import { getSessionFromRequest, type SessionPayload } from './session'
import type { ResponseData } from '@/pages/api'

export function unauthorized(res: NextApiResponse<ResponseData>, message = 'Unauthorized') {
  return res.status(401).json({ message, result: false, data: null })
}

export function forbidden(res: NextApiResponse<ResponseData>, message = 'Forbidden') {
  return res.status(403).json({ message, result: false, data: null })
}

/** Require a valid session cookie. Returns the session or null after sending 401. */
export async function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
): Promise<SessionPayload | null> {
  if (!assertSameOrigin(req, res)) return null

  const session = await getSessionFromRequest(req)
  if (!session) {
    unauthorized(res)
    return null
  }
  return session
}

/**
 * Ensure the caller is authenticated and that any provided user_id matches the session.
 * Prefer trusting session.userId over client-supplied IDs.
 */
export function toSingleId(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null
  const raw = Array.isArray(value) ? value[0] : value
  const id = Number(raw)
  return Number.isFinite(id) && id > 0 ? id : null
}

export async function requireAuthUserId(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  requestedUserId?: unknown
): Promise<number | null> {
  const session = await requireAuth(req, res)
  if (!session) return null

  if (requestedUserId !== undefined && requestedUserId !== null && requestedUserId !== '') {
    const id = toSingleId(requestedUserId)
    if (id && id !== session.userId) {
      forbidden(res, 'User mismatch')
      return null
    }
  }

  return session.userId
}

export async function assertWalletOwnedByUser(
  walletId: number,
  userId: number
): Promise<boolean> {
  const wallet = await prisma.wallets.findFirst({
    where: { id: walletId, user_id: userId, status: 1 },
    select: { id: true },
  })
  return Boolean(wallet)
}

export async function assertStoreOwnedByUser(
  storeId: number,
  userId: number
): Promise<boolean> {
  const store = await prisma.stores.findFirst({
    where: { id: storeId, user_id: userId, status: 1 },
    select: { id: true },
  })
  return Boolean(store)
}

export async function assertLightningOwnedByUser(
  lightningId: number,
  userId: number
): Promise<boolean> {
  const row = await prisma.wallet_lightning_networks.findFirst({
    where: { id: lightningId, user_id: userId, status: 1 },
    select: { id: true },
  })
  return Boolean(row)
}

/** True when the address belongs to one of the user's active wallets. */
export async function assertAddressOwnedByUser(
  address: string,
  userId: number,
  opts?: { chainId?: number; network?: number; walletId?: number }
): Promise<boolean> {
  const addr = String(address || '').trim()
  if (!addr) return false
  const row = await prisma.addresses.findFirst({
    where: {
      user_id: userId,
      status: 1,
      address: addr,
      ...(opts?.chainId ? { chain_id: opts.chainId } : {}),
      ...(opts?.network ? { network: opts.network } : {}),
      ...(opts?.walletId ? { wallet_id: opts.walletId } : {}),
    },
    select: { id: true },
  })
  return Boolean(row)
}

/**
 * Auth + store access with at least ViewStores.
 * Returns store owner id as `userId` for DB rows keyed by the owning merchant.
 */
export async function requireOwnedStore(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  storeIdRaw: unknown,
  userIdRaw?: unknown
): Promise<
  { userId: number; storeId: number; actorUserId: number; isOwner: boolean } | null
> {
  const access = await requireStorePermission(
    req,
    res,
    storeIdRaw,
    STORE_PERMISSION.ViewStores,
    userIdRaw
  )
  if (!access) return null
  return {
    userId: access.ownerUserId,
    storeId: access.storeId,
    actorUserId: access.actorUserId,
    isOwner: access.isOwner,
  }
}

export async function requireStoreAccess(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  storeIdRaw: unknown,
  userIdRaw?: unknown
): Promise<(StoreAccess & { userId: number }) | null> {
  const actorUserId = await requireAuthUserId(req, res, userIdRaw)
  if (!actorUserId) return null

  const storeId = toSingleId(storeIdRaw)
  if (!storeId) {
    res.status(200).json({ message: 'Invalid storeId', result: false, data: null })
    return null
  }

  const access = await getStoreAccess(storeId, actorUserId)
  if (!access) {
    forbidden(res)
    return null
  }

  return { ...access, userId: access.ownerUserId }
}

/** Require store access and a specific ROLEPERMISSIONS id. */
export async function requireStorePermission(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  storeIdRaw: unknown,
  permissionId: number,
  userIdRaw?: unknown
): Promise<(StoreAccess & { userId: number }) | null> {
  const access = await requireStoreAccess(req, res, storeIdRaw, userIdRaw)
  if (!access) return null

  if (!storeAccessHasPermission(access, permissionId)) {
    forbidden(res, 'Insufficient store permission')
    return null
  }

  return access
}

/** Auth + wallet ownership in one step. */
export async function requireOwnedWallet(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  walletIdRaw: unknown,
  userIdRaw?: unknown
): Promise<{ userId: number; walletId: number } | null> {
  const userId = await requireAuthUserId(req, res, userIdRaw)
  if (!userId) return null

  const walletId = toSingleId(walletIdRaw)
  if (!walletId) {
    res.status(200).json({ message: 'Invalid walletId', result: false, data: null })
    return null
  }

  if (!(await assertWalletOwnedByUser(walletId, userId))) {
    forbidden(res)
    return null
  }

  return { userId, walletId }
}

export function requireCronSecret(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
): boolean {
  const expected = process.env.CRON_SECRET
  if (!expected || expected.length < 16) {
    console.error('CRON_SECRET is not configured')
    unauthorized(res, 'Cron not configured')
    return false
  }

  const header = req.headers[CRON_HEADER_NAME]
  const value = Array.isArray(header) ? header[0] : header
  if (!value || value !== expected) {
    unauthorized(res, 'Invalid cron secret')
    return false
  }
  return true
}
