import OptimismSVG from '@/assets/chain/optimism.svg'
import { CHAINS } from '@/packages/constants/blockchain'
import { GetBlockchainAddressUrl } from '@/utils/chain/op'
import EvmChainWalletPage from '../EvmChainWalletPage'

const Optimism = () => (
  <EvmChainWalletPage
    chainId={CHAINS.OPTIMISM}
    displayName="Optimism Wallet"
    gasTrackerTitle="Optimism Gas Tracker"
    chainSvg={OptimismSVG}
    sendHref={`/wallets/send?chainId=${CHAINS.OPTIMISM}`}
    getBlockchainAddressUrl={GetBlockchainAddressUrl}
    holdingsTitle="Optimism"
  />
)

export default Optimism
