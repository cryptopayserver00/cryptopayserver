import LitecoinSVG from '@/assets/chain/litecoin.svg'
import { CHAINS } from '@/packages/constants/blockchain'
import { GetBlockchainTxUrl } from '@/utils/chain/ltc'
import UtxoSendPage from '../../UtxoSendPage'

const LitecoinSend = () => (
  <UtxoSendPage
    chainId={CHAINS.LITECOIN}
    chainSvg={LitecoinSVG}
    getBlockchainTxUrl={GetBlockchainTxUrl}
    feeRateUnit="litoshi"
    feeAdornment="lit/vB"
    doneHref="/wallets/litecoin"
  />
)

export default LitecoinSend
