import axios from 'axios';
import { CHAINIDS, CHAINS } from 'packages/constants/blockchain';

export class POL {
  static chain = CHAINS.POLYGON;

  static axiosInstance = axios.create({
    timeout: 10000,
  });

  static getChainIds(isMainnet: boolean): CHAINIDS {
    return isMainnet ? CHAINIDS.POLYGON : CHAINIDS.POLYGON_TESTNET;
  }
}
