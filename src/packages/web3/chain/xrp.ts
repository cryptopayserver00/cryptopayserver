import axios from 'axios';
import { CHAINIDS, CHAINS } from 'packages/constants/blockchain';

export class XRP {
  static chain = CHAINS.XRP;

  static axiosInstance = axios.create({
    timeout: 10000,
  });

  static getChainIds(isMainnet: boolean): CHAINIDS {
    return isMainnet ? CHAINIDS.XRP : CHAINIDS.XRP_TESTNET;
  }
}
