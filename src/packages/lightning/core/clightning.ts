import * as net from 'net';
import axios from 'axios';
import { LIGHTNINGNAME } from 'packages/constants/blockchain';
import { randomBytes } from 'crypto';
import { MsatoshisToBtc } from 'utils/number';

// https://docs.corelightning.org/reference
export class CLIGHTNING {
  static lightningName = LIGHTNINGNAME.CLIGHTNING;

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

  static async testConnection(server: string, rune?: string): Promise<[boolean, any?]> {
    try {
      if (!rune) {
        return [false];
      }
      if (await this.getNodeInfo(server, rune)) {
        return [true];
      }
      return [false];
    } catch (e) {
      console.error(e);
      return [false];
    }
  }

  static async payInvoice(server: string, invoice: string, rune?: string): Promise<boolean> {
    try {
      if (!rune) {
        return false;
      }
      const baseUrl = this.parseServer(server);
      const response: any = await this.axiosInstance.post(
        `${baseUrl}/v1/pay`,
        {
          bolt11: invoice,
        },
        {
          headers: {
            Rune: rune,
          },
        },
      );
      if (response.status === 201 && response.data) {
        return response.data.status === 'complete' ? true : false;
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
    rune?: string,
  ): Promise<string> {
    try {
      if (!rune) {
        return '';
      }
      const baseUrl = this.parseServer(server);
      const response: any = await this.axiosInstance.post(
        `${baseUrl}/v1/invoice`,
        {
          amount_msat: amount.toString(),
          description: description ? description : undefined,
          label: description ? description : undefined,
        },
        {
          headers: {
            Rune: rune,
          },
        },
      );
      if (response.status === 201 && response.data) {
        return response.data.bolt11;
      }
      return '';
    } catch (e) {
      console.error(e);
      return '';
    }
  }

  static async getInvoiceStatus(server: string, paymentHash: string, rune?: string): Promise<boolean> {
    try {
      if (!rune) {
        return false;
      }
      const baseUrl = this.parseServer(server);
      const response: any = await this.axiosInstance.post(
        `${baseUrl}/v1/listinvoices`,
        {
          payment_hash: paymentHash,
        },
        {
          headers: {
            Rune: rune,
          },
        },
      );
      if (response.status === 201 && response.data && response.data.invoices.length > 0) {
        return response.data.invoices.find((item: any) => item.payment_hash === paymentHash).status === 'paid'
          ? true
          : false;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  static async getBalance(server: string, rune?: string): Promise<number> {
    try {
      if (!rune) {
        return 0;
      }
      const baseUrl = this.parseServer(server);
      const response: any = await this.axiosInstance.post(
        `${baseUrl}/v1/listchannels`,
        {},
        {
          headers: {
            Rune: rune,
          },
        },
      );
      if (response.status === 201 && response.data && response.data.channels.length > 0) {
        const totalAmount = response.data.channels.reduce((sum: number, channel: any) => sum + channel.amount_msat, 0);
        return MsatoshisToBtc(totalAmount);
      }
      return 0;
    } catch (e) {
      console.error(e);
      return 0;
    }
  }

  static async getNodeInfo(server: string, rune?: string): Promise<any> {
    try {
      if (!rune) {
        return null;
      }
      const baseUrl = this.parseServer(server);
      const response: any = await this.axiosInstance.post(
        `${baseUrl}/v1/getinfo`,
        {},
        {
          headers: {
            Rune: rune,
          },
        },
      );
      if (response.status === 201 && response.data) {
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
    rune?: string,
  ): Promise<boolean> {
    try {
      if (!rune) {
        return false;
      }
      const baseUrl = this.parseServer(server);
      const response: any = this.axiosInstance.post(
        `${baseUrl}/v1/fundchannel`,
        {
          id: remoteId,
          amount: localAmt,
          announce: true,
        },
        {
          headers: {
            Rune: rune,
          },
        },
      );
      if (response.status === 201 && response.data) {
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}
