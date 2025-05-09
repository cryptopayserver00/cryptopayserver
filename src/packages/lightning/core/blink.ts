import * as net from 'net';
import axios from 'axios';
import { LIGHTNINGNAME } from 'packages/constants/blockchain';

type ParsedConnectionString = {
  baseUrl: string;
  apiKey: string;
  walletId: string;
};

// https://dev.blink.sv/
export class BLINK {
  static lightningName = LIGHTNINGNAME.BLINK;

  static axiosInstance = axios.create({
    timeout: 50000,
  });

  static parseConnectionString(connectionString: string): ParsedConnectionString {
    const values: Record<string, string> = {};
    connectionString.split(';').forEach((line) => {
      const [key, value] = line.split('=');
      if (key && value) {
        values[key] = value;
      }
    });

    const baseUrl = values['server'];
    const apiKey = values['api-key'];
    const walletId = values['wallet-id'];

    return { baseUrl, apiKey, walletId };
  }

  static async doGraphQLQuery(query: string, variables: any): Promise<any> {
    try {
      const response = await this.axiosInstance.post('', { query, variables });
      // const { errors } = Object.values(response.data)[0] || {};
      return response;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  static async payInvoice(invoice: string, walletId: number): Promise<boolean> {
    try {
      const query =
        'mutation LnInvoicePaymentSend($input: LnInvoicePaymentInput!) { lnInvoicePaymentSend(input: $input) { status errors { message path code } } }';
      const variables = {
        input: {
          paymentRequest: invoice,
          walletId: walletId,
        },
      };
      const response: any = await this.doGraphQLQuery(query, variables);
      //   const { preimage } = Object.values(response.data)[0] || {};
      //   return { id: null, preimage: preimage || null };
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  static async addInvoice(amountMSats: number, descriptionHash?: string): Promise<string> {
    try {
      const wallet = await this.getWalletInfo();
      const { walletCurrency } = wallet;
      const amount = Math.floor(amountMSats / 1000); // Convert to sats
      //   const recipientWalletId = walletId;
      const recipientWalletId = '';

      let query: string;
      const variables = { input: { amount, descriptionHash, recipientWalletId } };

      if (walletCurrency === 'USD') {
        query =
          'mutation lnUsdInvoiceBtcDenominatedCreateOnBehalfOfRecipient($input: LnUsdInvoiceBtcDenominatedCreateOnBehalfOfRecipientInput!) { lnUsdInvoiceBtcDenominatedCreateOnBehalfOfRecipient(input: $input) { errors { message } invoice { paymentRequest paymentHash paymentSecret satoshis } } }';
      } else if (walletCurrency === 'BTC') {
        query =
          'mutation lnInvoiceCreateOnBehalfOfRecipient($input: LnInvoiceCreateOnBehalfOfRecipientInput!) { lnInvoiceCreateOnBehalfOfRecipient(input: $input) { errors { message } invoice { paymentRequest paymentHash paymentSecret satoshis } } }';
      } else {
        throw new Error(`Unsupported Blink wallet currency: "${walletCurrency}"`);
      }

      const response: any = await this.doGraphQLQuery(query, variables);
      //   const { paymentRequest } = Object.values(response.data)[0].invoice || {};
      //   return { id: null, invoice: paymentRequest };
      return response.data[0].invoice;
    } catch (e) {
      console.error(e);
      return '';
    }
  }

  static async getInvoiceStatus(paymentHash: string): Promise<any> {
    try {
      const query =
        'query lnInvoicePaymentStatusByHash($input: LnInvoicePaymentStatusByHashInput!) { lnInvoicePaymentStatusByHash(input: $input) { paymentHash paymentRequest status } }';
      const variables = { input: { paymentHash } };
      const response: any = await this.doGraphQLQuery(query, variables);
      //   const { status, paymentHash: hash, paymentRequest } = Object.values(response.data)[0] || {};
      const { status, paymentHash: hash, paymentRequest } = response.data[0];
      const preimage = null; // Blink doesn't provide preimage
      const settled = status === 'PAID';
      //   return { preimage, settled };
      return response;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  static async getBalance(): Promise<number> {
    try {
      const response = await this.getWalletInfo();
      return parseInt(response.balance) * 1000; // Convert to msat
    } catch (e) {
      console.error(e);
      return 0;
    }
  }

  static async getWalletInfo(): Promise<any> {
    try {
      const walletId = '';
      const response: any = this.getWalletInfoById(walletId);
      return response;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  static async getWalletInfoById(walletId: string): Promise<any> {
    try {
      const query = 'query me { me { defaultAccount { wallets { id walletCurrency balance }}}}';
      const variables = {};
      const response: any = await this.doGraphQLQuery(query, variables);
      const wallets = (response.data.me?.defaultAccount?.wallets || []) as Array<{
        id: string;
        walletCurrency: 'BTC' | 'USD';
        balance: string;
      }>;
      const wallet = wallets.find((_wallet) => _wallet.id === walletId);
      return wallet;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  static async getNodeUri(): Promise<any> {
    throw new Error('Not supported by this LN service.');
  }

  static async openChannel(remoteId: string, localAmt: number, pushAmt: number, makePrivate: boolean): Promise<any> {
    throw new Error('Not supported by this LN service.');
  }
}
