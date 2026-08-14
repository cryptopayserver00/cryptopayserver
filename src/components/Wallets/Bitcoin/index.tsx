import BitcoinSVG from '@/assets/chain/bitcoin.svg'
import { CHAINS } from '@/packages/constants/blockchain'
import { GetBlockchainAddressUrl } from '@/utils/chain/btc'
import UtxoChainWalletPage from '../UtxoChainWalletPage'

const Bitcoin = () => (
  <UtxoChainWalletPage
    chainId={CHAINS.BITCOIN}
    displayName="Bitcoin Wallet"
    chainSvg={BitcoinSVG}
    sendHref="/wallets/bitcoin/send"
    showPrivateKeyButton
    getBlockchainAddressUrl={GetBlockchainAddressUrl}
  />
)

export default Bitcoin
