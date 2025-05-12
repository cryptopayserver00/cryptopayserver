import { LIGHTNINGNAME } from 'packages/constants/blockchain';
import { LNDHUB } from './core/lndhub';
import lightningPayReq from 'bolt11';

export class LIGHTNING {
  static async testConnection(name: LIGHTNINGNAME, server: string): Promise<[boolean, any?]> {
    switch (name) {
      case LIGHTNINGNAME.LNDHUB:
        return await LNDHUB.testConnection(server);
      default:
        return [false];
    }
  }

  static async addInvoice(
    name: LIGHTNINGNAME,
    server: string,
    amount: number,
    description?: string,
    descriptionHash?: string,
    accessToken?: string,
  ): Promise<string> {
    switch (name) {
      case LIGHTNINGNAME.LNDHUB:
        return await LNDHUB.addInvoice(server, amount, description, descriptionHash, accessToken);
      default:
        return '';
    }
  }

  static async getInvoiceStatus(
    name: LIGHTNINGNAME,
    server: string,
    invoice: string,
    accessToken?: string,
  ): Promise<boolean> {
    if (!invoice) return false;

    const decodeInvoice = lightningPayReq.decode(invoice).tags.find((item) => item.tagName === 'payment_hash')?.data;

    if (!decodeInvoice) return false;

    switch (name) {
      case LIGHTNINGNAME.LNDHUB:
        return await LNDHUB.getInvoiceStatus(server, String(decodeInvoice), accessToken);
      default:
        return false;
    }
  }
}
