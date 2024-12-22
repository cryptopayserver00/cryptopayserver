import axios from 'axios';

export type BlockScanWalletType = {
  address: string;
  chain_id: number;
};

export class BLOCKSCAN {
  static baseUrl = 'http://127.0.0.1:7777/api';

  static axiosInstance = axios.create({
    timeout: 10000,
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
}
