import axios from 'axios';
import { CHAINIDS, CHAINS } from 'packages/constants/blockchain';

export class ARB {
  static chain = CHAINS.ARBITRUM;

  static axiosInstance = axios.create({
    timeout: 10000,
  });

  static getChainIds(isMainnet: boolean): CHAINIDS {
    return isMainnet ? CHAINIDS.ARBITRUM_ONE : CHAINIDS.ARBITRUM_SEPOLIA;
  }
}
