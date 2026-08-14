import AvalancheSVG from '@/assets/chain/avalanche.svg'
import { CHAINS } from '@/packages/constants/blockchain'
import { GetBlockchainAddressUrl } from '@/utils/chain/avax'
import EvmChainWalletPage from '../EvmChainWalletPage'

const Avalanche = () => (
  <EvmChainWalletPage
    chainId={CHAINS.AVALANCHE}
    displayName="Avalanche Wallet"
    gasTrackerTitle="Avalanche Gas Tracker"
    chainSvg={AvalancheSVG}
    sendHref={`/wallets/send?chainId=${CHAINS.AVALANCHE}`}
    getBlockchainAddressUrl={GetBlockchainAddressUrl}
    holdingsTitle="Avalanche"
  />
)

export default Avalanche
