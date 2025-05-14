import axios from 'axios';
import { LIGHTNINGNAME } from 'packages/constants/blockchain';
import { BtcToMsatoshis, MsatoshisToBtc } from 'utils/number';

// lnd's REST API documentation:
// https://api.lightning.community/#lnd-rest-api-reference
export class LND {
  static lightningName = LIGHTNINGNAME.LND;

  static axiosInstance = axios.create({
    timeout: 50000,
  });

  static parseServer(server: string): string {
    if (!server) {
      return '';
    }
    if (server.slice(-1) === '/') {
      server = server.slice(0, -1);
    }

    return server;
  }

  static async testConnection(server: string, macaroon?: string, certthumbprint?: string): Promise<[boolean, any?]> {
    try {
      if (!macaroon) {
        return [false];
      }
      if (await this.getNodeInfo(server, macaroon, certthumbprint)) {
        return [true];
      }
      return [false];
    } catch (e) {
      console.error(e);
      return [false];
    }
  }

  static async payInvoice(
    server: string,
    invoice: string,
    macaroon?: string,
    certthumbprint?: string,
  ): Promise<boolean> {
    try {
      if (!macaroon) {
        return false;
      }
      const baseUrl = this.parseServer(server);
      const response: any = await this.axiosInstance.post(
        `${baseUrl}/v1/channels/transactions`,
        {
          payment_request: invoice,
        },
        {
          headers: {
            'Grpc-Metadata-macaroon': macaroon,
            cert: certthumbprint,
          },
        },
      );
      console.log('payInvoice', response);
      if (response.status === 200 && response.data) {
        //   const paymentHash = getTagDataFromPaymentRequest(invoice, 'payment_hash');
        const preimage = Buffer.from(response.payment_preimage, 'base64').toString('hex');
        //   return { id: null, preimage };
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  static async addInvoice(
    server: string,
    amount: number,
    description?: string,
    descriptionHash?: string,
    macaroon?: string,
    certthumbprint?: string,
  ): Promise<string> {
    try {
      if (!macaroon) {
        return '';
      }
      const baseUrl = this.parseServer(server);
      const response: any = await this.axiosInstance.post(
        `${baseUrl}/v1/invoices`,
        {
          value_msat: amount.toString(),
          description_hash: descriptionHash ? descriptionHash : undefined,
          memo: description ? description : undefined,
        },
        {
          headers: {
            'Grpc-Metadata-macaroon': macaroon,
            cert: certthumbprint,
          },
        },
      );
      if (response.status === 200 && response.data) {
        return response.data.payment_request;
      }
      return '';
    } catch (e) {
      console.error(e);
      return '';
    }
  }

  static async getInvoiceStatus(
    server: string,
    paymentHash: string,
    macaroon?: string,
    certthumbprint?: string,
  ): Promise<boolean> {
    try {
      if (!macaroon) {
        return false;
      }
      const baseUrl = this.parseServer(server);
      const response: any = await this.axiosInstance.get(`${baseUrl}/v1/invoice/${paymentHash}`, {
        headers: {
          'Grpc-Metadata-macaroon': macaroon,
          cert: certthumbprint,
        },
      });
      if (response.status === 200 && response.data) {
        console.log('getInvoiceStatus', response.data);
        const preimage = (response.r_preimage && Buffer.from(response.r_preimage, 'base64').toString('hex')) || null;
        return response.data.settled ? true : false;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  static async getBalance(server: string, macaroon?: string, certthumbprint?: string): Promise<number> {
    try {
      if (!macaroon) {
        return 0;
      }
      const baseUrl = this.parseServer(server);
      const response: any = await this.axiosInstance.get(`${baseUrl}/v1/balance/channels`, {
        headers: {
          'Grpc-Metadata-macaroon': macaroon,
          cert: certthumbprint,
        },
      });
      if (response.status === 200 && response.data) {
        return MsatoshisToBtc(response.data.local_balance.msat);
      }
      return 0;
    } catch (e) {
      console.error(e);
      return 0;
    }
  }

  static async getNodeInfo(server: string, macaroon?: string, certthumbprint?: string): Promise<any> {
    try {
      if (!macaroon) {
        return null;
      }
      const baseUrl = this.parseServer(server);
      const response: any = await this.axiosInstance.get(`${baseUrl}/v1/getinfo`, {
        headers: {
          'Grpc-Metadata-macaroon': macaroon,
          cert: certthumbprint,
        },
      });
      console.log('getNodeInfo', response);
      if (response.status === 200 && response.data) {
        return response.data;
      }
      return null;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  static async openChannel(
    server: string,
    remoteId: string,
    localAmt: number,
    pushAmt: number,
    makePrivate: boolean,
    macaroon?: string,
    certthumbprint?: string,
  ): Promise<boolean> {
    try {
      if (!macaroon) {
        return false;
      }
      const baseUrl = this.parseServer(server);
      const response: any = this.axiosInstance.post(
        `${baseUrl}/v1/channels`,
        {
          node_pubkey_string: remoteId,
          local_funding_amount: localAmt,
          push_sat: pushAmt,
          private: makePrivate,
        },
        {
          headers: {
            'Grpc-Metadata-macaroon': macaroon,
            cert: certthumbprint,
          },
        },
      );
      console.log('openChannel', response);
      if (response.status === 200 && response.data) {
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}
