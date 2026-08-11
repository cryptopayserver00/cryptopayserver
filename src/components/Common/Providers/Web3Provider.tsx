import { FC, ReactNode } from 'react'
import dynamic from 'next/dynamic'

const WagmiContextProvider = dynamic(() => import('./WagmiContextProvider'), { ssr: false })

type Props = {
  children: ReactNode
}

const Web3Provider = ({ children, cookies }: { children: ReactNode; cookies: string | null }) => {
  return <WagmiContextProvider cookies={cookies}>{children}</WagmiContextProvider>
}

export default Web3Provider
