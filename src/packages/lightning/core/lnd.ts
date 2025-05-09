import axios from 'axios';
import { LIGHTNINGNAME } from 'packages/constants/blockchain';

// lnd's REST API documentation:
// https://api.lightning.community/#lnd-rest-api-reference
export class LND {
  static lightningName = LIGHTNINGNAME.LND;

  static axiosInstance = axios.create({
    timeout: 50000,
  });

  static async getNodeUri(): Promise<string> {
    try {
      const response = await this.getNodeInfo();
      return response.uris[0];
    } catch (e) {
      console.error(e);
      return '';
    }
  }

  static async getNodeInfo(): Promise<any> {
    try {
      const response: any = await this.axiosInstance.get('/v1/getinfo');
      return response;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  static async openChannel(remoteId: string, localAmt: number, pushAmt: number, makePrivate: boolean): Promise<any> {
    try {
      const response: any = this.axiosInstance.post('/v1/channels', {
        node_pubkey_string: remoteId,
        local_funding_amount: localAmt,
        push_sat: pushAmt,
        private: makePrivate,
      });

      return response;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  static async payInvoice(invoice: string): Promise<boolean> {
    try {
      const response: any = await this.axiosInstance.post('/v1/channels/transactions', {
        payment_request: invoice,
      });

      //   const paymentHash = getTagDataFromPaymentRequest(invoice, 'payment_hash');
      const preimage = Buffer.from(response.payment_preimage, 'base64').toString('hex');
      //   return { id: null, preimage };

      console.log('payInvoice', response);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  static async addInvoice(amount: number, descriptionHash?: string): Promise<string> {
    try {
      const data: { value_msat: number; description_hash?: string } = {
        value_msat: amount,
      };
      if (descriptionHash) {
        data.description_hash = Buffer.from(descriptionHash, 'hex').toString('base64');
      }
      const response: any = await this.axiosInstance.post('/v1/invoices', data);

      //   return {
      //     id: null,
      //     invoice: result.payment_request,
      //   };
      return response.payment_request;
    } catch (e) {
      console.error(e);
      return '';
    }
  }

  static async getInvoiceStatus(paymentHash: string): Promise<any> {
    try {
      const r_hash = encodeURIComponent(paymentHash);
      const response: any = await this.axiosInstance.get(`/v1/invoice/${r_hash}`);

      const preimage = (response.r_preimage && Buffer.from(response.r_preimage, 'base64').toString('hex')) || null;
      const settled = response.settled === true;
      //   return { preimage, settled };
      return response;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  static async getBalance(): Promise<number> {
    try {
      const response: any = await this.axiosInstance.get('/v1/balance/channels');
      return parseInt(response.local_balance.msat);
    } catch (e) {
      console.error(e);
      return 0;
    }
  }
}
