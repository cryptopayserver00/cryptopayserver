import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { GetAllSupportAppKitNetwork } from '@/utils/web3'
import { WALLETCONNECT_PROJECT_ID } from '@/packages/constants'

export const projectId = WALLETCONNECT_PROJECT_ID
if (!projectId) throw new Error('Project ID is not defined')

export const networks = GetAllSupportAppKitNetwork()
if (!networks) throw new Error('Networks ID is not defined')

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  projectId,
  networks,
  // ssr: true,
})
