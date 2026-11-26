import {
  useStorePresistStore,
  useUserPresistStore,
  useWalletPresistStore,
} from '@/lib/store'

/** Clear persisted client auth mirrors when the server session is gone. */
export function clearClientAuthState(): void {
  useUserPresistStore.getState().resetUser()
  useStorePresistStore.getState().resetStore()
  useWalletPresistStore.getState().resetWallet()
}

export function isAuthPagePath(pathname: string): boolean {
  return (
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password')
  )
}
