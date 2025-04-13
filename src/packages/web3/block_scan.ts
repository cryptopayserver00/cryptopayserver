import axios from 'axios';
import { IS_DEVELOPMENT } from 'packages/constants';

export type BlockScanWalletType = {
  address: string;
  chain_id: number;
};

export class BLOCKSCAN {
  static baseUrl = 'https://api.cryptopayserver.xyz/api';

  static axiosInstance = axios.create({
    timeout: 50000,
  });

  static async bulkStoreUserWallet(bulk_storage: BlockScanWalletType[]): Promise<boolean> {
    try {
      const url = this.baseUrl + '/bulkStoreUserWallet';

      if (!bulk_storage || bulk_storage.length <= 0) {
        return false;
      }

      const response = await this.axiosInstance.post(url, {
        headers: {
          accept: 'application/json',
        },
        bulk_storage: bulk_storage,
      });

      if (response && response.data && response.data.code === 10200) {
        return true;
      }

      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  static async getFreeCoin(chainId: number, address: string, coin: string, amount: string): Promise<string> {
    try {
      const url = this.baseUrl + '/coinFree';
      const response: any = await this.axiosInstance.get(url, {
        headers: {
          accept: 'application/json',
        },
        params: {
          chain_id: chainId,
          address: address,
          coin: coin,
          amount: amount,
        },
      });

      if (response && response.data && response.data.code === 10200) {
        return response.data.data.hash;
      }

      return '';
    } catch (e) {
      console.error(e);
      return '';
    }
  }

  static getBlockchainAddressTransactionUrl(chainids: string, address: string): string {
    const url = this.baseUrl + '/getTransactionsByChainAndAddress';
    const page = 0;
    const pageSize = 10;
    return `${url}/?chainids=${chainids}&addresses=${address}&page=${page}&page_size=${pageSize}`;
  }

  static async getTransactionsByChainAndAddress(
    chainids?: string,
    addresses?: string,
    page?: number,
    pageSize?: number,
  ): Promise<any> {
    try {
      let findData: { [key: string]: any } = {};

      if (chainids !== undefined) findData.chainids = chainids;
      if (addresses !== undefined) findData.addresses = addresses;
      if (page) {
        findData.page = page;
      } else {
        findData.page = 1;
      }

      if (pageSize) {
        findData.page_size = pageSize;
      } else {
        findData.page_size = 10;
      }

      const url = this.baseUrl + '/getTransactionsByChainAndAddress';
      const response: any = await this.axiosInstance.get(url, {
        headers: {
          accept: 'application/json',
        },
        params: findData,
      });
      if (response && response.data && response.data.code === 10200) {
        return response.data.data;
      }

      return null;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}
