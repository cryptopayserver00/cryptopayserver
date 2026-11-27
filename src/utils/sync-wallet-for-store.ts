import { useWalletPresistStore } from '@/lib/store'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'

/**
 * Reconcile client wallet flags with the server for a store.
 * Logout clears local wallet state; login / sidebar must restore it from DB.
 * Returns the wallet id when found, otherwise 0.
 */
export async function syncWalletForStore(storeId: number): Promise<number> {
  if (!storeId) {
    useWalletPresistStore.getState().resetWallet()
    return 0
  }

  try {
    const response: any = await axios.get(Http.find_wallet, {
      params: { store_id: storeId },
    })

    if (response?.result && response.data?.id) {
      const walletId = Number(response.data.id)
      useWalletPresistStore.getState().setWalletId(walletId)
      useWalletPresistStore.getState().setIsWallet(true)
      return walletId
    }
  } catch (e) {
    console.error(e)
  }

  useWalletPresistStore.getState().resetWallet()
  return 0
}
