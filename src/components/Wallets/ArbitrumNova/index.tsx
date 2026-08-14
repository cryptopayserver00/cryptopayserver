import ArbitrumNovaSVG from '@/assets/chain/arbitrumnova.svg'
import { CHAINS } from '@/packages/constants/blockchain'
import { GetBlockchainAddressUrl } from '@/utils/chain/arbnova'
import EvmChainWalletPage from '../EvmChainWalletPage'

const ArbitrumNova = () => (
  <EvmChainWalletPage
    chainId={CHAINS.ARBITRUMNOVA}
    displayName="Arbitrum Nova Wallet"
    gasTrackerTitle="Arbitrum Nova Gas Tracker"
    chainSvg={ArbitrumNovaSVG}
    sendHref={`/wallets/send?chainId=${CHAINS.ARBITRUMNOVA}`}
    getBlockchainAddressUrl={GetBlockchainAddressUrl}
  />
)

export default ArbitrumNova
