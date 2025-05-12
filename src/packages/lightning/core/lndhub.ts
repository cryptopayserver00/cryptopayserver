import axios from 'axios';
import { LIGHTNINGNAME } from 'packages/constants/blockchain';
import { createHash } from 'crypto';

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

  static async authorize(
    baseUrl: string,
    login: string,
    password: string,
    refreshToken?: string,
    refreshTokenCreatedTime?: number,
  ): Promise<[boolean, any?]> {
    try {
      //   let data: { login: string; password: string } | { refresh_token: string };
      //   let type: 'auth' | 'refresh_token';

      //   if (this.refreshToken && !this.refreshTokenIsExpired()) {
      //     data = { refresh_token: this.refreshToken };
      //     type = 'refresh_token';
      //   } else {
      //     const { login, password } = this.options as ParsedServer;
      //     data = { login, password };
      //     type = 'auth';
      //   }

      // Remove existing Authorization header
      //   if (this.options.headers?.['Authorization']) {
      //     delete this.options.headers['Authorization'];
      //     this.axiosInstance.defaults.headers.common['Authorization'] = undefined;
      //   }

      let response: any = null;

      if (refreshToken && !this.refreshTokenIsExpired(refreshTokenCreatedTime)) {
        const url = baseUrl + '/auth?type=refresh_token';
        const data = { refresh_token: refreshToken };

        response = await this.axiosInstance.post(url, data);
      } else {
        const url = baseUrl + '/auth?type=auth';
        const data = { login: login, password: password };

        response = await this.axiosInstance.post(url, data);
      }

      if (response.status === 200 && response.data) {
        // const accessTokenCreatedTime = Date.now();
        // const refreshTokenCreatedTime = Date.now();
        const accessToken = response.data.access_token;
        const refreshToken = response.data.refresh_token;
        // this.options.headers = this.options.headers || {};
        // this.options.headers['Authorization'] = `Bearer ${response.access_token}`;
        // this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.access_token}`;

        return [
          true,
          {
            accessToken: accessToken,
            // accessTokenCreatedTime: accessTokenCreatedTime,
            refreshToken: refreshToken,
            // refreshTokenCreatedTime: refreshTokenCreatedTime,
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

  // static isAuthorized(): boolean {
  //   return !!this.accessToken && !this.accessTokenIsExpired();
  // }

  // static async onAuthorized(): Promise<void> {
  //   if (this.isAuthorized()) {
  //     return;
  //   }
  //   await this.authorize();
  // }

  static accessTokenIsExpired(accessTokenCreatedTime?: number): boolean {
    if (accessTokenCreatedTime) {
      return Date.now() - accessTokenCreatedTime >= this.accessTokenMaxAge;
    } else {
      return false;
    }
  }

  static refreshTokenIsExpired(refreshTokenCreatedTime?: number): boolean {
    if (refreshTokenCreatedTime) {
      return Date.now() - refreshTokenCreatedTime >= this.refreshTokenMaxAge;
    } else {
      return false;
    }
  }

  static async payInvoice(invoice: string): Promise<boolean> {
    try {
      const response: any = await this.axiosInstance.post('/payinvoice', { invoice });

      let preimage = '';
      if (response.payment_preimage) {
        if (typeof response.payment_preimage === 'string') {
          preimage = response.payment_preimage;
        } else if (typeof response.payment_preimage === 'object' && response.payment_preimage.type === 'Buffer') {
          preimage = Buffer.from(response.payment_preimage.data, 'hex').toString('hex');
        }
        if (preimage) {
          const paymentHash = createHash('sha256').update(Buffer.from(preimage, 'hex')).digest('hex');
          // Optionally use paymentHash for validation
          console.log('preimage', preimage);
        }
      }

      return true;
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
          amt: amount.toString(), // Convert to sats, must be string
          description_hash: descriptionHash ? descriptionHash : undefined,
          memo: description ? description : undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.status === 200) {
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

      if (response.status === 200) {
        return response.data.paid ? true : false;
      }

      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  static async getBalance(): Promise<number> {
    try {
      const response: any = await this.axiosInstance.get('/balance');
      return parseInt(response['BTC']['AvailableBalance']) * 1000;
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
