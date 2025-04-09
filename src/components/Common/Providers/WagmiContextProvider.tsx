import { wagmiAdapter } from './WagmiAdapter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { mainnet, arbitrum, avalanche, base, optimism, polygon } from '@reown/appkit/networks';
import React, { type ReactNode } from 'react';
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi';
import { GetAllSupportAppKitNetwork } from 'utils/web3';
import { WALLETCONNECT_PROJECT_ID } from 'packages/constants';

const queryClient = new QueryClient();

const metadata = {
  name: 'cryptopayserver',
  description: 'AppKit Example',
  url: 'https://reown.com/appkit', // origin must match your domain & subdomain
  icons: ['https://assets.reown.com/reown-profile-pic.png'],
};

createAppKit({
  adapters: [wagmiAdapter],
  projectId: String(WALLETCONNECT_PROJECT_ID),
  networks: GetAllSupportAppKitNetwork(),
  defaultNetwork: mainnet,
  metadata: metadata,
  features: {
    analytics: false,
    socials: [],
    email: false,
  },
  allWallets: 'HIDE',
});

function WagmiContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies);

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

export default WagmiContextProvider;
