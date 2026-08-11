// import { wagmiAdapter } from './WagmiAdapter';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { createAppKit } from '@reown/appkit/react';
// import { mainnet, arbitrum, avalanche, base, optimism, polygon } from '@reown/appkit/networks';
// import React, { type ReactNode } from 'react';
// import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi';
// import { GetAllSupportAppKitNetwork } from '@/utils/web3';
// import { WALLETCONNECT_PROJECT_ID } from '@/packages/constants';

// const queryClient = new QueryClient();

// const metadata = {
//   name: 'Cryptopayserver',
//   description: 'Free services to help you buy and sell products and collect cryptocurrencies.',
//   url: 'https://cryptopayserver.online',
//   icons: ['https://cryptopayserver.online/favicon.ico'],
// };

// createAppKit({
//   adapters: [wagmiAdapter],
//   projectId: String(WALLETCONNECT_PROJECT_ID),
//   networks: GetAllSupportAppKitNetwork(),
//   defaultNetwork: mainnet,
//   metadata: metadata,
//   features: {
//     analytics: false,
//     socials: [],
//     email: false,
//   },
// });

// function WagmiContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
//   const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies);

//   return (
//     <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
//       <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
//     </WagmiProvider>
//   );
// }

// export default WagmiContextProvider;

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { mainnet } from '@reown/appkit/networks'
import React, { type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'
import { GetAllSupportAppKitNetwork } from '@/utils/web3'
import { WALLETCONNECT_PROJECT_ID } from '@/packages/constants'
import { wagmiAdapter } from './WagmiAdapter'
import { Http } from '@/utils/http/http'

const queryClient = new QueryClient()

const metadata = {
  name: 'Cryptopayserver',
  description: 'Free services to help you buy and sell products and collect cryptocurrencies.',
  url: 'https://cryptopayserver.online',
  icons: ['https://cryptopayserver.online/favicon.ico'],
}

export const projectId = WALLETCONNECT_PROJECT_ID
if (!projectId) throw new Error('Project ID is not defined')

export const networks = GetAllSupportAppKitNetwork()
if (!networks) throw new Error('Networks ID is not defined')

declare global {
  // eslint-disable-next-line no-var
  var __APPKIT_INITIALIZED__: boolean | undefined
}

if (!globalThis.__APPKIT_INITIALIZED__) {
  createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks,
    defaultNetwork: mainnet,
    metadata,
    features: {
      analytics: false,
      socials: [],
      email: false,
    },
  })
  globalThis.__APPKIT_INITIALIZED__ = true
}

function WagmiContextProvider({
  children,
  cookies,
}: {
  children: ReactNode
  cookies: string | null
}) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

export default WagmiContextProvider
