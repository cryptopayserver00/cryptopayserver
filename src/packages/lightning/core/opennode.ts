import axios from 'axios';
import { LIGHTNINGNAME } from 'packages/constants/blockchain';

// https://developers.opennode.com/reference/
export class OPENNODE {
  static lightningName = LIGHTNINGNAME.OPENNODE;

  static axiosInstance = axios.create({
    timeout: 50000,
  });

  static async payInvoice(invoice: string, callbackUrl?: string): Promise<boolean> {
    try {
      const postData: { type: string; address: string; callback_url?: string } = {
        type: 'ln',
        address: invoice,
      };
      if (callbackUrl) {
        postData.callback_url = callbackUrl;
      }

      const response: any = await this.axiosInstance.post('/v2/withdrawals', postData);
      const { id } = response.data;

      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  static async addInvoice(amount: number, description?: string, callbackUrl?: string): Promise<string> {
    try {
      const postData: { amount: number; currency: string; description?: string; callback_url?: string } = {
        amount: Math.floor(amount / 1000), // Convert to sats
        currency: 'BTC',
        description: description,
      };
      if (callbackUrl) {
        postData.callback_url = callbackUrl;
      }

      const response: any = await this.axiosInstance.post('/v1/charges', postData);

      //   return {
      //     id: response.data.id,
      //     invoice: response.data.lightning_invoice.payreq,
      //   };

      return response.data.lightning_invoice.payreq;
    } catch (e) {
      console.error(e);
      return '';
    }
  }

  static async getInvoiceStatus(id: string): Promise<boolean> {
    try {
      const withdrawalId = encodeURIComponent(id);
      const response: any = await this.axiosInstance.get(`/v1/withdrawal/${withdrawalId}`);

      //   return {
      //     preimage: null,
      //     settled: response.data.status === 'confirmed',
      //   };
      return response.data.status === 'confirmed';
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  static async getBalance(): Promise<number> {
    try {
      const response: any = await this.axiosInstance.get('/v1/account/balance');
      return parseInt(response.data.balance.BTC) * 1000;
    } catch (e) {
      console.error(e);
      return 0;
    }
  }

  static async openChannel(remoteId: string, localAmt: number, pushAmt: number, makePrivate: boolean): Promise<any> {
    throw new Error('Not supported by this LN service.');
  }
}
