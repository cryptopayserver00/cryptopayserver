import BscSVG from '@/assets/chain/bsc.svg'
import { CHAINS } from '@/packages/constants/blockchain'
import { GetBlockchainAddressUrl } from '@/utils/chain/bsc'
import EvmChainWalletPage from '../EvmChainWalletPage'

const Bsc = () => (
  <EvmChainWalletPage
    chainId={CHAINS.BSC}
    displayName="Binance Smart Chain Wallet"
    gasTrackerTitle="Bsc Gas Tracker"
    chainSvg={BscSVG}
    sendHref={`/wallets/send?chainId=${CHAINS.BSC}`}
    getBlockchainAddressUrl={GetBlockchainAddressUrl}
    holdingsTitle="Binance Smart Chain"
  />
)

export default Bsc
