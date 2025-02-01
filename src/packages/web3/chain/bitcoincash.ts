import axios from 'axios';
import { CHAINIDS, CHAINS } from 'packages/constants/blockchain';

export class BITCOINCASH {
  static chain = CHAINS.BITCOINCASH;

  static axiosInstance = axios.create({
    timeout: 10000,
  });

  static getChainIds(isMainnet: boolean): CHAINIDS {
    return isMainnet ? CHAINIDS.BITCOINCASH : CHAINIDS.BITCOINCASH_TESTNET;
  }
}
