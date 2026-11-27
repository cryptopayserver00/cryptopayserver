const STORAGE_KEY = 'cryptopayserver.last-store-by-user'

type LastStoreMap = Record<string, number>

function readMap(): LastStoreMap {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as LastStoreMap) : {}
  } catch {
    return {}
  }
}

function writeMap(map: LastStoreMap): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    // ignore quota / private-mode failures
  }
}

/** Persist the active store for a user so login can restore it after logout. */
export function rememberLastStore(userId: number, storeId: number): void {
  if (!userId || !storeId) return
  const map = readMap()
  map[String(userId)] = storeId
  writeMap(map)
}

/** Last store id remembered for this user, or 0 if none. */
export function getLastStoreId(userId: number): number {
  if (!userId) return 0
  const value = readMap()[String(userId)]
  const id = Number(value)
  return Number.isFinite(id) && id > 0 ? id : 0
}

/**
 * Pick the store to activate after login / session restore.
 * Prefer the remembered store when it still exists; otherwise first in list.
 */
export function pickPreferredStore<T extends { id: number }>(
  userId: number,
  stores: T[],
  preferredId?: number
): T | undefined {
  if (!stores.length) return undefined
  const remembered = preferredId && preferredId > 0 ? preferredId : getLastStoreId(userId)
  if (remembered) {
    const hit = stores.find((s) => s.id === remembered)
    if (hit) return hit
  }
  return stores[0]
}
