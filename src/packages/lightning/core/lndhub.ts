import axios from 'axios';
import { LIGHTNINGNAME } from 'packages/constants/blockchain';
import { createHash } from 'crypto';
import { SatoshisToBtc } from 'utils/number';

type ParsedServer = {
  baseUrl: string;
  login: string;
  password: string;
};

// https://github.com/BlueWallet/LndHub/blob/master/doc/Send-requirements.md
export class LNDHUB {
  static lightningName = LIGHTNINGNAME.LNDHUB;

  static axiosInstance = axios.create({
    timeout: 50000,
  });

  static accessTokenMaxAge = 7200000;
  static refreshTokenMaxAge = 604800000;

  static parseServer(server: string): ParsedServer {
    if (!server) {
      return { baseUrl: '', login: '', password: '' };
    }
    let baseUrl = server.split('@')[1];
    if (baseUrl.slice(-1) === '/') {
      baseUrl = baseUrl.slice(0, -1);
    }
    const loginAndPassword = server.split('@')[0].substring('lndhub://'.length);
    const [login = '', password = ''] = loginAndPassword.split(':');
    return { baseUrl, login, password };
  }

  static async authorize(baseUrl: string, login: string, password: string): Promise<[boolean, any?]> {
    try {
      const response: any = await this.axiosInstance.post(`${baseUrl}/auth?type=auth`, {
        login,
        password,
      });
      if (response.status === 200 && response.data) {
        const accessToken = response.data.access_token;
        const refreshToken = response.data.refresh_token;
        return [
          true,
          {
            accessToken: accessToken,
            refreshToken: refreshToken,
          },
        ];
      }
      return [false];
    } catch (e) {
      console.error(e);
      return [false];
    }
  }

  static async testConnection(server: string): Promise<[boolean, any?]> {
    try {
      const { baseUrl, login, password } = this.parseServer(server);
      if (baseUrl && login && password) {
        return await this.authorize(baseUrl, login, password);
      }
      return [false];
    } catch (e) {
      console.error(e);
      return [false];
    }
  }

  static async payInvoice(server: string, invoice: string, accessToken?: string): Promise<boolean> {
    try {
      if (!accessToken || !invoice) {
        return false;
      }
      const { baseUrl, login, password } = this.parseServer(server);
      const response: any = await this.axiosInstance.post(
        `${baseUrl}/payinvoice`,
        { invoice },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      if (response.status === 200 && response.data) {
        console.log('payInvoice', response.data);

        let preimage = '';
        if (response.data.payment_preimage) {
          if (typeof response.data.payment_preimage === 'string') {
            preimage = response.data.payment_preimage;
          } else if (
            typeof response.data.payment_preimage === 'object' &&
            response.data.payment_preimage.type === 'Buffer'
          ) {
            preimage = Buffer.from(response.data.payment_preimage.data, 'hex').toString('hex');
          }
          if (preimage) {
            // const paymentHash = createHash('sha256').update(Buffer.from(preimage, 'hex')).digest('hex');
            // Optionally use paymentHash for validation
            console.log('preimage', preimage);
          }
        }
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
    accessToken?: string,
  ): Promise<string> {
    try {
      if (!accessToken || !amount) {
        return '';
      }
      const { baseUrl, login, password } = this.parseServer(server);
      const response: any = await this.axiosInstance.post(
        `${baseUrl}/addinvoice`,
        {
          amt: amount.toString(),
          description_hash: descriptionHash ? descriptionHash : undefined,
          memo: description ? description : undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
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

  static async getInvoiceStatus(server: string, paymentHash: string, accessToken?: string): Promise<boolean> {
    try {
      if (!accessToken || !paymentHash) {
        return false;
      }
      const { baseUrl, login, password } = this.parseServer(server);
      const response: any = await this.axiosInstance.get(`${baseUrl}/checkpayment/${paymentHash}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.status === 200 && response.data) {
        return response.data.paid ? true : false;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  static async getBalance(server: string, accessToken?: string): Promise<number> {
    try {
      if (!accessToken) {
        return 0;
      }
      const { baseUrl, login, password } = this.parseServer(server);
      const response: any = await this.axiosInstance.get(`${baseUrl}/balance`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.status === 200 && response.data) {
        return SatoshisToBtc(response.data.BTC.AvailableBalance);
      }
      return 0;
    } catch (e) {
      console.error(e);
      return 0;
    }
  }

  static async openChannel(remoteId: string, localAmt: number, pushAmt: number, makePrivate: boolean): Promise<any> {
    throw new Error('Not supported by this LN service.');
  }
}
