import { cookieStorage, createStorage } from '@wagmi/core';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { GetAllSupportAppKitNetwork } from 'utils/web3';
import { WALLETCONNECT_PROJECT_ID } from 'packages/constants';

export const networks = GetAllSupportAppKitNetwork();

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId: String(WALLETCONNECT_PROJECT_ID),
  networks,
});

export const config = wagmiAdapter.wagmiConfig;
