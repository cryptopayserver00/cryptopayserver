import axios from 'axios';
import { CHAINIDS, CHAINS } from 'packages/constants/blockchain';

export class OP {
  static chain = CHAINS.OPTIMISM;

  static axiosInstance = axios.create({
    timeout: 10000,
  });

  static getChainIds(isMainnet: boolean): CHAINIDS {
    return isMainnet ? CHAINIDS.OPTIMISM : CHAINIDS.OPTIMISM_SEPOLIA;
  }
}
