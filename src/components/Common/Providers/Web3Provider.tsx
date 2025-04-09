import { FC, ReactNode } from 'react';
import WagmiContextProvider from './WagmiContextProvider';

type Props = {
  children: ReactNode;
};

const Web3Provider = ({ children, cookies }: { children: ReactNode; cookies: string | null }) => {
  return <WagmiContextProvider cookies={cookies}>{children}</WagmiContextProvider>;
};

export default Web3Provider;
