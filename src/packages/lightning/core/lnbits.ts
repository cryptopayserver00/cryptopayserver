import axios from 'axios';
import { LIGHTNINGNAME } from 'packages/constants/blockchain';

export class LNBITS {
  static lightningName = LIGHTNINGNAME.LNBITS;

  static axiosInstance = axios.create({
    timeout: 50000,
  });

  static async payInvoice(invoice: string): Promise<boolean> {
    try {
      const response: any = await this.axiosInstance.post('/api/v1/payments', {
        out: true,
        bolt11: invoice,
      });

      //   const preimage = null; // LNBits never returns a preimage
      //   return { id: null, preimage };
      console.log('payInvoice', response);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  static async addInvoice(amount: number, description?: string, descriptionHash?: string): Promise<string> {
    try {
      const response: any = await this.axiosInstance.post('/api/v1/payments', {
        out: false,
        amount: Math.floor(amount / 1000), // Convert to sats
        unhashed_description: description ? Buffer.from(description, 'utf8').toString('hex') : undefined,
        description_hash: descriptionHash,
      });

      //   return {
      //     id: null,
      //     invoice: response.payment_request,
      //   };
      return response.payment_request;
    } catch (e) {
      console.error(e);
      return '';
    }
  }

  static async getInvoiceStatus(paymentHash: string): Promise<any> {
    try {
      const payment_hash = encodeURIComponent(paymentHash);
      const response: any = await this.axiosInstance.get(`/api/v1/payments/${payment_hash}`);
      //   const preimage = response.preimage || null;
      //   const settled = response.paid === true;
      //   return {
      //     preimage,
      //     settled,
      //   };
      return response;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  static async getBalance(): Promise<number> {
    try {
      const response: any = await this.axiosInstance.get('/api/v1/wallet');
      return parseInt(response.balance);
    } catch (e) {
      console.error(e);
      return 0;
    }
  }

  static async getNodeUri(): Promise<any> {
    throw new Error('Not supported by this LN service.');
  }

  static async openChannel(remoteId: string, localAmt: number, pushAmt: number, makePrivate: boolean): Promise<any> {
    throw new Error('Not supported by this LN service.');
  }
}
