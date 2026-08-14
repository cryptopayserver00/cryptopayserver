import BaseSVG from '@/assets/chain/base.svg'
import { CHAINS } from '@/packages/constants/blockchain'
import { GetBlockchainAddressUrl } from '@/utils/chain/base'
import EvmChainWalletPage from '../EvmChainWalletPage'

const Base = () => (
  <EvmChainWalletPage
    chainId={CHAINS.BASE}
    displayName="Base Wallet"
    gasTrackerTitle="Base Gas Tracker"
    chainSvg={BaseSVG}
    sendHref={`/wallets/send?chainId=${CHAINS.BASE}`}
    getBlockchainAddressUrl={GetBlockchainAddressUrl}
    holdingsTitle="Base"
  />
)

export default Base
