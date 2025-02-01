import axios from 'axios';
import { CHAINIDS, CHAINS } from 'packages/constants/blockchain';

export class AVALANCHE {
  static chain = CHAINS.AVALANCHE;

  static axiosInstance = axios.create({
    timeout: 10000,
  });

  static getChainIds(isMainnet: boolean): CHAINIDS {
    return isMainnet ? CHAINIDS.AVALANCHE : CHAINIDS.AVALANCHE_TESTNET;
  }
}
