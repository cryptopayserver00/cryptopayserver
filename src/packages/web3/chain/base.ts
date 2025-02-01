import axios from 'axios';
import { CHAINIDS, CHAINS } from 'packages/constants/blockchain';

export class BASE {
  static chain = CHAINS.BASE;

  static axiosInstance = axios.create({
    timeout: 10000,
  });

  static getChainIds(isMainnet: boolean): CHAINIDS {
    return isMainnet ? CHAINIDS.BASE : CHAINIDS.BASE_SEPOLIA;
  }
}
