import { BLOCKCHAINNAMES, CHAINIDS } from 'packages/constants/blockchain';
import axios, { AxiosRequestConfig } from 'axios';

export class RPC {
  static axiosInstance = axios.create({
    timeout: 50000,
  });

  static async callRPC(chainIds: CHAINIDS, method: string, params: any): Promise<any> {
    console.log('callRPC', chainIds, method, params);

    const data = JSON.stringify({
      jsonrpc: '2.0',
      method: method,
      params: params,
      id: 1,
    });

    const url = this.getRpcByChainIds(chainIds);
    if (!url || url === '') return null;

    const config: AxiosRequestConfig = {
      method: 'POST',
      maxBodyLength: Infinity,
      url: url,
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };

    try {
      const response = await this.axiosInstance.request(config);

      if (response.status !== 200) {
        console.error(response.data);
        return null;
      }

      if (response.data.error) {
        console.error(`${JSON.stringify(response.data.error)} | ${JSON.stringify(config)}`);
        return null;
      }
      return response.data;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  static getRpcByChainIds(chainIds: CHAINIDS): string {
    const rpcs = BLOCKCHAINNAMES.find((item) => item.chainId === chainIds)?.rpc;
    if (rpcs && rpcs?.length > 0) {
      const randomIndex = Math.floor(Math.random() * rpcs.length);
      return rpcs[randomIndex];
    }

    throw new Error('can not support the rpc of chain');
  }
}
