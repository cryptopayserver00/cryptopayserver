import LitecoinSVG from '@/assets/chain/litecoin.svg';
import { CHAINS } from '@/packages/constants/blockchain';
import { GetBlockchainAddressUrl } from '@/utils/chain/ltc';
import UtxoChainWalletPage from '../UtxoChainWalletPage';

const Litecoin = () => (
  <UtxoChainWalletPage
    chainId={CHAINS.LITECOIN}
    displayName="Litecoin Wallet"
    chainSvg={LitecoinSVG}
    sendHref="/wallets/litecoin/send"
    getBlockchainAddressUrl={GetBlockchainAddressUrl}
  />
);

export default Litecoin;