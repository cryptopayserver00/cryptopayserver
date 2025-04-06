// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { injected, metaMask, walletConnect, coinbaseWallet } from '@wagmi/connectors';
import { FC, ReactNode } from 'react';
// import { WagmiProvider, createConfig } from 'wagmi';
// import { http } from '@wagmi/core';
// import { mainnet, sepolia } from '@wagmi/core/chains';

import { cookieStorage, createStorage, http } from '@wagmi/core';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, arbitrum } from '@reown/appkit/networks';
import WagmiContextProvider from './WagmiContextProvider';

// const projectId = 'test';
// const connectors: any = [injected(), metaMask(), walletConnect({ projectId }), coinbaseWallet()];
// const connectors: any = [injected()];

// // @ts-ignore
// const wagmiConfig = createConfig({
//   chains: [mainnet, sepolia],
//   connectors: connectors,
//   transports: {
//     [mainnet.id]: http(''),
//     [sepolia.id]: http(''),
//   },
// });

// const queryClient = new QueryClient();

export const projectId = 'db22437d7de9e742b9646aef64f6c9e0';

if (!projectId) {
  throw new Error('Project ID is not defined');
}

export const networks = [mainnet, arbitrum];

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
});

type Props = {
  children: ReactNode;
};

const Web3Provider = ({ children, cookies }: { children: ReactNode; cookies: string | null }) => {
  return (
    <WagmiContextProvider cookies={cookies}>{children}</WagmiContextProvider>

    // <WagmiProvider
    // config={wagmiConfig({
    //   chains: [mainnet, sepolia],
    //   connectors: connectors,
    //   transports: {
    //     [mainnet.id]: http(''),
    //     [sepolia.id]: http(''),
    //   },
    // })}
    //   config={wagmiConfig}
    // >
    //   <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    // </WagmiProvider>
  );
};

export default Web3Provider;
