import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import {
  unauthorized,
  forbidden,
  toSingleId,
} from './api'
import { assertSameOrigin } from './csrf'
import { getStoreAccess } from './rbac'
import { getSessionFromRequest } from './session'
import { isHashedApiKey, sealApiKey } from './api-key-crypto'
import { rateLimit } from './rate-limit'
import type { ResponseData } from '@/pages/api'

export type ApiKeyContext = {
  userId: number
  storeId: number
  apiKeyId: number
  permissions: string
}

/** Legacy plaintext API-key lookup — never in production. */
function legacyPlaintextApiKeysAllowed(): boolean {
  const enabled =
    process.env.ALLOW_LEGACY_PLAINTEXT_API_KEYS === 'true' ||
    process.env.ALLOW_LEGACY_PLAINTEXT_API_KEYS === '1'
  if (!enabled) return false
  if (process.env.NODE_ENV === 'production') {
    console.error(
      '[api-key] ALLOW_LEGACY_PLAINTEXT_API_KEYS is ignored in production; re-hash keys with yarn secrets:reencrypt'
    )
    return false
  }
  return true
}

export function readApiKey(req: NextApiRequest): string | null {
  const header = req.headers['x-api-key']
  if (typeof header === 'string' && header.trim()) return header.trim()
  return null
}

async function lookupApiKey(apiKey: string): Promise<ApiKeyContext | null> {
  const sealed = sealApiKey(apiKey)

  let row = await prisma.api_key_settings.findFirst({
    where: {
      api_key: sealed,
      status: 1,
    },
  })

  // Legacy plaintext lookup — non-production migration only.
  if (!row && legacyPlaintextApiKeysAllowed()) {
    row = await prisma.api_key_settings.findFirst({
      where: {
        api_key: apiKey,
        status: 1,
      },
    })
    if (row && !isHashedApiKey(row.api_key)) {
      await prisma.api_key_settings.update({
        where: { id: row.id },
        data: { api_key: sealed },
      })
    }
  }

  if (!row) return null

  const store = await prisma.stores.findFirst({
    where: { id: row.store_id, status: 1 },
    select: { id: true, user_id: true },
  })
  if (!store) return null

  const owner = await prisma.users.findFirst({
    where: { id: store.user_id, status: 1 },
    select: { id: true },
  })
  if (!owner) return null

  return {
    userId: row.user_id,
    storeId: row.store_id,
    apiKeyId: row.id,
    permissions: row.permissions,
  }
}

/** Authenticate using store API key header (X-API-Key). */
export async function requireApiKey(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  storeIdRaw?: unknown
): Promise<ApiKeyContext | null> {
  const apiKey = readApiKey(req)
  if (!apiKey) {
    unauthorized(res, 'API key required')
    return null
  }

  const ctx = await lookupApiKey(apiKey)
  if (!ctx) {
    if (!(await rateLimit(req, res, { scope: 'api-key-fail', limit: 30, windowMs: 15 * 60 * 1000 }))) {
      return null
    }
    unauthorized(res, 'Invalid API key')
    return null
  }

  if (storeIdRaw !== undefined && storeIdRaw !== null && storeIdRaw !== '') {
    const storeId = toSingleId(storeIdRaw)
    if (storeId && storeId !== ctx.storeId) {
      forbidden(res, 'API key store mismatch')
      return null
    }
  }

  return ctx
}

export type AuthOrApiKeyContext = {
  /** Store owner id — use for DB rows keyed by merchant user_id */
  userId: number
  storeId: number
  via: 'session' | 'api_key'
  /** Session actor (invitee or owner); undefined for API key */
  actorUserId?: number
  /** Comma-separated permission ids when via === 'api_key' */
  permissions?: string
}

/** True when the API key's stored permission ids include `requiredId`. */
export function apiKeyHasPermission(permissions: string | undefined, requiredId: number): boolean {
  if (!permissions) return false
  return permissions
    .split(',')
    .map((p) => p.trim())
    .includes(String(requiredId))
}

/**
 * Prefer session cookie; fall back to X-API-Key.
 */
export async function requireAuthOrApiKey(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  storeIdRaw: unknown,
  userIdRaw?: unknown
): Promise<AuthOrApiKeyContext | null> {
  const storeId = toSingleId(storeIdRaw)
  if (!storeId) {
    res.status(200).json({ message: 'Invalid storeId', result: false, data: null })
    return null
  }

  const session = await getSessionFromRequest(req)
  if (session) {
    if (!assertSameOrigin(req, res)) return null
    if (userIdRaw !== undefined && userIdRaw !== null && userIdRaw !== '') {
      const requested = toSingleId(userIdRaw)
      if (requested && requested !== session.userId) {
        forbidden(res, 'User mismatch')
        return null
      }
    }
    const access = await getStoreAccess(storeId, session.userId)
    if (!access) {
      forbidden(res)
      return null
    }
    // Use store owner id for DB rows; invitees act on the owner's store data.
    return {
      userId: access.ownerUserId,
      storeId,
      via: 'session',
      actorUserId: access.actorUserId,
    }
  }

  const apiKey = readApiKey(req)
  if (!apiKey) {
    unauthorized(res)
    return null
  }

  const ctx = await lookupApiKey(apiKey)
  if (!ctx) {
    if (!(await rateLimit(req, res, { scope: 'api-key-fail', limit: 30, windowMs: 15 * 60 * 1000 }))) {
      return null
    }
    unauthorized(res, 'Invalid API key')
    return null
  }
  if (ctx.storeId !== storeId) {
    forbidden(res, 'API key store mismatch')
    return null
  }
  if (userIdRaw !== undefined && userIdRaw !== null && userIdRaw !== '') {
    const requested = toSingleId(userIdRaw)
    if (requested && requested !== ctx.userId) {
      forbidden(res, 'User mismatch')
      return null
    }
  }

  return {
    userId: ctx.userId,
    storeId: ctx.storeId,
    via: 'api_key',
    permissions: ctx.permissions,
  }
}
