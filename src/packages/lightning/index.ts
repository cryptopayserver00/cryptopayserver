import { LIGHTNINGNAME } from 'packages/constants/blockchain';
import { LNDHUB } from './core/lndhub';
import lightningPayReq from 'bolt11';
import { LND } from './core/lnd';
import { CLIGHTNING } from './core/clightning';

export class LIGHTNING {
  static async testConnection(
    name: LIGHTNINGNAME,
    server: string,
    macaroon?: string,
    certthumbprint?: string,
    rune?: string,
  ): Promise<[boolean, any?]> {
    switch (name) {
      case LIGHTNINGNAME.CLIGHTNING:
        return await CLIGHTNING.testConnection(server, rune);
      case LIGHTNINGNAME.LND:
        return await LND.testConnection(server, macaroon, certthumbprint);
      case LIGHTNINGNAME.LNDHUB:
        return await LNDHUB.testConnection(server);
      default:
        return [false];
    }
  }

  static async payInvoice(
    name: LIGHTNINGNAME,
    server: string,
    invoice: string,
    accessToken?: string,
    macaroon?: string,
    certthumbprint?: string,
    rune?: string,
  ): Promise<boolean> {
    if (!invoice) return false;

    switch (name) {
      case LIGHTNINGNAME.CLIGHTNING:
        return await CLIGHTNING.payInvoice(server, invoice, rune);
      case LIGHTNINGNAME.LND:
        return await LND.payInvoice(server, invoice, macaroon, certthumbprint);
      case LIGHTNINGNAME.LNDHUB:
        return await LNDHUB.payInvoice(server, invoice, accessToken);
      default:
        return false;
    }
  }

  static async addInvoice(
    name: LIGHTNINGNAME,
    server: string,
    amount: number,
    description?: string,
    descriptionHash?: string,
    accessToken?: string,
    macaroon?: string,
    certthumbprint?: string,
    rune?: string,
  ): Promise<string> {
    switch (name) {
      case LIGHTNINGNAME.CLIGHTNING:
        return await CLIGHTNING.addInvoice(server, amount, description, descriptionHash, rune);
      case LIGHTNINGNAME.LND:
        return await LND.addInvoice(server, amount, description, descriptionHash, macaroon, certthumbprint);
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
    macaroon?: string,
    certthumbprint?: string,
    rune?: string,
  ): Promise<boolean> {
    if (!invoice) return false;

    const decodeInvoice = lightningPayReq.decode(invoice).tags.find((item) => item.tagName === 'payment_hash')?.data;

    if (!decodeInvoice) return false;

    switch (name) {
      case LIGHTNINGNAME.CLIGHTNING:
        return await CLIGHTNING.getInvoiceStatus(server, String(decodeInvoice), rune);
      case LIGHTNINGNAME.LND:
        return await LND.getInvoiceStatus(server, String(decodeInvoice), macaroon, certthumbprint);
      case LIGHTNINGNAME.LNDHUB:
        return await LNDHUB.getInvoiceStatus(server, String(decodeInvoice), accessToken);
      default:
        return false;
    }
  }

  static async getBalance(
    name: LIGHTNINGNAME,
    server: string,
    accessToken?: string,
    macaroon?: string,
    certthumbprint?: string,
    rune?: string,
  ): Promise<number> {
    switch (name) {
      case LIGHTNINGNAME.CLIGHTNING:
        return await CLIGHTNING.getBalance(server, rune);
      case LIGHTNINGNAME.LND:
        return await LND.getBalance(server, macaroon, certthumbprint);
      case LIGHTNINGNAME.LNDHUB:
        return await LNDHUB.getBalance(server, accessToken);
      default:
        return 0;
    }
  }
}
