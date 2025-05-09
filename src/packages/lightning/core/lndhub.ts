import axios from 'axios';
import { LIGHTNINGNAME } from 'packages/constants/blockchain';

interface ParsedSecret {
  baseUrl: string | null;
  login: string;
  password: string;
}

export class LNDHUB {
  static lightningName = LIGHTNINGNAME.LNDHUB;

  static axiosInstance = axios.create({
    timeout: 50000,
  });

  static accessTokenMaxAge = 7200000;
  static refreshTokenMaxAge = 604800000;

  static parseSecret(secret: string): ParsedSecret {
    if (!secret) {
      return { baseUrl: null, login: '', password: '' };
    }

    const baseUrl = secret.split('@')[1] || null;
    const loginAndPassword = secret.split('@')[0].substring('lndhub://'.length);
    const [login = '', password = ''] = loginAndPassword.split(':');
    return { baseUrl, login, password };
  }

  static async authorize(): Promise<boolean> {
    try {
      //   let data: { login: string; password: string } | { refresh_token: string };
      //   let type: 'auth' | 'refresh_token';

      //   if (this.refreshToken && !this.refreshTokenIsExpired()) {
      //     data = { refresh_token: this.refreshToken };
      //     type = 'refresh_token';
      //   } else {
      //     const { login, password } = this.options as ParsedSecret;
      //     data = { login, password };
      //     type = 'auth';
      //   }

      // Remove existing Authorization header
      //   if (this.options.headers?.['Authorization']) {
      //     delete this.options.headers['Authorization'];
      //     this.axiosInstance.defaults.headers.common['Authorization'] = undefined;
      //   }

      let response: any = undefined;

      if (this.refreshToken && !this.refreshTokenIsExpired()) {
        const url = '/auth?type=refresh_token';
        const data = { refresh_token: this.refreshToken };

        response = await this.axiosInstance.post(url, data);
      } else {
        const url = '/auth?type=auth';
        const data = { login: '', password: '' };

        response = await this.axiosInstance.post(url, data);
      }

      const url = `/auth?type=${type}`;
      response = await this.axiosInstance.post(url, data);
      if (response) {
      }

      //   const response = await this.request('post', `/auth?type=${type}`, data);
      this.accessTokenCreatedTime = Date.now();
      this.refreshTokenCreatedTime = Date.now();
      this.accessToken = response.access_token;
      this.refreshToken = response.refresh_token;
      this.options.headers = this.options.headers || {};
      this.options.headers['Authorization'] = `Bearer ${response.access_token}`;
      this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.access_token}`;

      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  static isAuthorized(): boolean {
    return !!this.accessToken && !this.accessTokenIsExpired();
  }

  static async onAuthorized(): Promise<void> {
    if (this.isAuthorized()) {
      return;
    }
    await this.authorize();
  }

  static accessTokenIsExpired(accessTokenCreatedTime: number): boolean {
    return Date.now() - accessTokenCreatedTime >= (this.options.accessTokenMaxAge || this.accessTokenMaxAge);
  }

  static refreshTokenIsExpired(refreshTokenCreatedTime: number): boolean {
    return Date.now() - refreshTokenCreatedTime >= (this.options.refreshTokenMaxAge || this.refreshTokenMaxAge);
  }

  static async payInvoice(invoice: string): Promise<{ id: null; preimage: string | null }> {
    const result = await this.tryAuthorizedRequest('post', '/payinvoice', { invoice });
    let preimage: string | null = null;

    if (result.payment_preimage) {
      if (typeof result.payment_preimage === 'string') {
        preimage = result.payment_preimage;
      } else if (typeof result.payment_preimage === 'object' && result.payment_preimage.type === 'Buffer') {
        preimage = Buffer.from(result.payment_preimage.data, 'hex').toString('hex');
      }
      if (preimage) {
        const paymentHash = crypto.createHash('sha256').update(Buffer.from(preimage, 'hex')).digest('hex');
        // Optionally use paymentHash for validation
      }
    }

    return { id: null, preimage };
  }

  static async addInvoice(
    amount: number,
    extra: { descriptionHash?: string; description?: string },
  ): Promise<{ id: null; invoice: string }> {
    const result = await this.tryAuthorizedRequest('post', '/addinvoice', {
      amt: Math.floor(amount / 1000).toString(), // Convert to sats, must be string
      description_hash: extra.descriptionHash,
      memo: extra.description,
    });
    return {
      id: null,
      invoice: result.payment_request,
    };
  }

  static async getInvoiceStatus(paymentHash: string): Promise<{ preimage: null; settled: boolean }> {
    const hash = encodeURIComponent(paymentHash);
    const result = await this.tryAuthorizedRequest('get', `/checkpayment/${hash}`);
    return {
      preimage: null,
      settled: result && result.paid === true,
    };
  }

  static async getBalance(): Promise<number> {
    try {
      const result = await this.request('get', '/balance');
      return parseInt(result['BTC']['AvailableBalance']) * 1000;
    } catch (e) {
      console.error(e);
      return 0;
    }
  }

  static async getNodeUri(): Promise<never> {
    throw new Error('Not supported by this LN service.');
  }

  static async openChannel(remoteId: string, localAmt: number, pushAmt: number, makePrivate: boolean): Promise<never> {
    throw new Error('Not supported by this LN service.');
  }
}
