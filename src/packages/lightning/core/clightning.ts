import * as net from 'net';
import axios from 'axios';
import { LIGHTNINGNAME } from 'packages/constants/blockchain';
import { randomBytes } from 'crypto';

// https://lightning.readthedocs.io
export class CLIGHTNING {
  static lightningName = LIGHTNINGNAME.CLIGHTNING;

  static axiosInstance = axios.create({
    timeout: 50000,
  });

  static openSocketConnection(unixSockPath: string): Promise<net.Socket> {
    return new Promise((resolve, reject) => {
      try {
        const socket = net.connect(unixSockPath, () => resolve(socket));
        socket.once('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  static async cmd(method: string, params?: any): Promise<any> {
    // const { clientId, options } = this;
    // const { delimiter = '\n', jsonrpc = '2.0', unixSockPath = '' } = options;

    const delimiter = '\n',
      jsonrpc = '2.0',
      unixSockPath = '';

    try {
      const socket = await this.openSocketConnection(unixSockPath).catch((error) => {
        if (/connect EACCES/.test(error.message)) {
          throw new Error('Could not connect to unix sock: Permission denied');
        } else if (/connect ENOENT/.test(error.message)) {
          throw new Error('Could not connect to unix sock: File not found');
        }
        throw error;
      });

      return new Promise((resolve, reject) => {
        // const id = [clientId, 'cmd', ++this.cmdIncrement].join('-');
        const id = '';
        const done = (error?: Error, result?: any) => {
          socket.destroy();
          if (error) return reject(error);
          resolve(result);
        };

        const onData = (data: Buffer) => {
          const messages = data.toString().trim().split('\n');
          messages.forEach((message) => {
            let json: any;
            try {
              json = JSON.parse(message);
            } catch (error) {
              // Ignore JSON parsing errors
            }
            // if (json && json.id && json.id === id) {
            if (json && json.id) {
              if (json.error) {
                return done(new Error(JSON.stringify(json.error)));
              }
              return done(undefined, json.result);
            }
          });
        };

        socket.on('data', onData);
        socket.write(JSON.stringify({ jsonrpc, method, params, id }) + delimiter);
      });
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  static async getNodeUri(): Promise<string> {
    try {
      const response: any = await this.cmd('getinfo');
      const { id, address } = response;
      if (address.length === 0) {
        return '';
      }
      const { type, port, address: addr } = address[0];
      let host = addr;
      if (type === 'ipv6') {
        host = `[${host}]`;
      }
      const hostname = `${host}:${port}`;
      return `${id}@${hostname}`;
    } catch (e) {
      console.error(e);
      return '';
    }
  }

  static async openChannel(remoteId: string, localAmt: number, pushAmt: number, makePrivate: boolean): Promise<any> {
    try {
      const response: any = this.cmd('fundchannel', {
        id: remoteId,
        amount: localAmt,
        announce: !makePrivate,
        push_msat: pushAmt * 1000,
      });

      return response;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  static async payInvoice(invoice: string): Promise<boolean> {
    try {
      const response: any = await this.cmd('pay', { bolt11: invoice });
      const preimage = response.payment_preimage || null;
      //   return { id: null, preimage };
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  static async addInvoice(amount: number, description?: string, descriptionHash?: string): Promise<string> {
    try {
      const params = {
        msatoshi: amount,
        label: randomBytes(20).toString('hex'),
        description: description,
        deschashonly: true,
      };
      const response: any = await this.cmd('invoice', params);
      //   return {
      //     id: null,
      //     invoice: response.bolt11,
      //   };
      return response.bolt11;
    } catch (e) {
      console.error(e);
      return '';
    }
  }

  static async getInvoiceStatus(paymentHash: string): Promise<any> {
    try {
      const params = {
        payment_hash: paymentHash,
      };
      const response: any = await this.cmd('listinvoices', params);

      const { status, payment_preimage } = response.invoices[0];

      const preimage = payment_preimage || null;
      const settled = status === 'paid';
      //   return { preimage, settled };
      return response;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  static async getBalance(): Promise<number> {
    try {
      const response: any = await this.cmd('listfunds');
      let balance = 0;
      response.channels
        .filter((channel: any) => channel.state === 'CHANNELD_NORMAL')
        .forEach((channel: any) => {
          const { our_amount_msat } = channel;
          const msat = parseInt(our_amount_msat.substring(0, our_amount_msat.length - 'msat'.length));
          if (Number.isInteger(msat)) {
            balance += msat;
          }
        });
      return balance;
    } catch (e) {
      console.error(e);
      return 0;
    }
  }
}
