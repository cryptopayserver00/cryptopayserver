import { ReactNode } from 'react'
import ErrorBoundary from '../ErrorBoundary'
import Web3Provider from './Web3Provider'

const Providers = ({ children, cookies }: { children: ReactNode; cookies: string | null }) => {
  return (
    <ErrorBoundary>
      <Web3Provider cookies={cookies}>{children}</Web3Provider>
    </ErrorBoundary>
  )
}

export default Providers
