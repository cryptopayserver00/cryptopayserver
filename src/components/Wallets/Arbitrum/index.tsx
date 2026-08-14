import ArbitrumSVG from '@/assets/chain/arbitrum.svg'
import { CHAINS } from '@/packages/constants/blockchain'
import { GetBlockchainAddressUrl } from '@/utils/chain/arb'
import EvmChainWalletPage from '../EvmChainWalletPage'

const Arbitrum = () => (
  <EvmChainWalletPage
    chainId={CHAINS.ARBITRUM}
    displayName="Arbitrum Wallet"
    gasTrackerTitle="Arbitrum Gas Tracker"
    chainSvg={ArbitrumSVG}
    sendHref={`/wallets/send?chainId=${CHAINS.ARBITRUM}`}
    getBlockchainAddressUrl={GetBlockchainAddressUrl}
  />
)

export default Arbitrum
