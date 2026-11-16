import { prisma } from '@/lib/prisma'
import { DEFAULT_USER_ROLE_PERMISSIONS, USER_ROLE } from '@/packages/constants'

/** ROLEPERMISSIONS ids used across store APIs. */
export const STORE_PERMISSION = {
  ModifyStores: 1,
  ManagePullPayments: 2,
  ModifyInvoices: 3,
  ViewStores: 4,
  ModifyWebhooks: 5,
  ModifyPaymentRequests: 6,
  ManagePayouts: 7,
} as const

export type StoreAccess = {
  /** Logged-in user performing the action */
  actorUserId: number
  storeId: number
  /** Store owner — use this for DB rows keyed by user_id */
  ownerUserId: number
  isOwner: boolean
  role: string
  permissionIds: Set<number>
}

function parsePermissionIds(raw: string | null | undefined): Set<number> {
  if (!raw) return new Set()
  return new Set(
    raw
      .split(',')
      .map((p) => Number(p.trim()))
      .filter((n) => Number.isFinite(n) && n > 0)
  )
}

function defaultPermissionsForRole(role: string): Set<number> {
  const map = DEFAULT_USER_ROLE_PERMISSIONS as Record<string, string>
  return parsePermissionIds(map[role] || '')
}

/**
 * Resolve store access for the actor: store owner, or invited staff matched by email.
 */
export async function getStoreAccess(
  storeId: number,
  actorUserId: number
): Promise<StoreAccess | null> {
  const store = await prisma.stores.findFirst({
    where: { id: storeId, status: 1 },
    select: { id: true, user_id: true },
  })
  if (!store) return null

  if (store.user_id === actorUserId) {
    return {
      actorUserId,
      storeId,
      ownerUserId: store.user_id,
      isOwner: true,
      role: USER_ROLE.Owner,
      permissionIds: defaultPermissionsForRole(USER_ROLE.Owner),
    }
  }

  const actor = await prisma.users.findFirst({
    where: { id: actorUserId, status: 1 },
    select: { email: true },
  })
  if (!actor?.email) return null

  const actorEmail = actor.email.trim().toLowerCase()
  let membership = await prisma.user_roles.findFirst({
    where: {
      store_id: storeId,
      email: actorEmail,
      status: 1,
    },
    select: { role: true },
  })
  // Fallback for legacy rows stored with mixed-case emails.
  if (!membership) {
    const candidates = await prisma.user_roles.findMany({
      where: { store_id: storeId, status: 1 },
      select: { role: true, email: true },
    })
    const hit = candidates.find((c) => c.email.trim().toLowerCase() === actorEmail)
    if (hit) membership = { role: hit.role }
  }
  if (!membership) return null

  const roleRow = await prisma.roles.findFirst({
    where: {
      store_id: storeId,
      role: membership.role,
      status: 1,
    },
    select: { permissions: true },
  })

  const permissionIds = roleRow?.permissions
    ? parsePermissionIds(roleRow.permissions)
    : defaultPermissionsForRole(membership.role)

  return {
    actorUserId,
    storeId,
    ownerUserId: store.user_id,
    isOwner: false,
    role: membership.role,
    permissionIds,
  }
}

export function storeAccessHasPermission(access: StoreAccess, permissionId: number): boolean {
  if (access.isOwner) return true
  return access.permissionIds.has(permissionId)
}
