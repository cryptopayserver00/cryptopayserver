import PolSVG from '@/assets/chain/polygon.svg'
import { CHAINS } from '@/packages/constants/blockchain'
import { GetBlockchainAddressUrl } from '@/utils/chain/pol'
import EvmChainWalletPage from '../EvmChainWalletPage'

const Polygon = () => (
  <EvmChainWalletPage
    chainId={CHAINS.POLYGON}
    displayName="Polygon Wallet"
    gasTrackerTitle="Polygon Gas Tracker"
    chainSvg={PolSVG}
    sendHref={`/wallets/send?chainId=${CHAINS.POLYGON}`}
    getBlockchainAddressUrl={GetBlockchainAddressUrl}
    holdingsTitle="Polygon"
  />
)

export default Polygon
