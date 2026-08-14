import BitcoinSVG from '@/assets/chain/bitcoin.svg'
import { CHAINS } from '@/packages/constants/blockchain'
import { GetBlockchainTxUrl } from '@/utils/chain/btc'
import UtxoSendPage from '../../UtxoSendPage'

const BitcoinSend = () => (
  <UtxoSendPage
    chainId={CHAINS.BITCOIN}
    chainSvg={BitcoinSVG}
    getBlockchainTxUrl={GetBlockchainTxUrl}
    feeRateUnit="satoshi"
    feeAdornment="sat/vB"
    doneHref="/wallets/bitcoin"
  />
)

export default BitcoinSend
