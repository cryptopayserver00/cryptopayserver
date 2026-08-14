import EthereumSVG from '@/assets/chain/ethereum.svg'
import { CHAINS } from '@/packages/constants/blockchain'
import { GetBlockchainAddressUrl } from '@/utils/chain/eth'
import EvmChainWalletPage from '../EvmChainWalletPage'

const Ethereum = () => (
  <EvmChainWalletPage
    chainId={CHAINS.ETHEREUM}
    displayName="Ethereum Wallet"
    gasTrackerTitle="Ethereum Gas Tracker"
    chainSvg={EthereumSVG}
    sendHref={`/wallets/send?chainId=${CHAINS.ETHEREUM}`}
    getBlockchainAddressUrl={GetBlockchainAddressUrl}
  />
)

export default Ethereum
