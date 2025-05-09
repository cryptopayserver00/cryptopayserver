import { LIGHTNINGNAME } from 'packages/constants/blockchain';
import { LNDHUB } from './core/lndhub';

export class LIGHTNING {
  static parseSecret(name: LIGHTNINGNAME, secret: string): any {
    switch (name) {
      case LIGHTNINGNAME.LNDHUB:
        return LNDHUB.parseSecret(secret);
      default:
        return '';
    }
  }

  static async testConnection(name: LIGHTNINGNAME, secret: string): Promise<[boolean, any?]> {
    switch (name) {
      case LIGHTNINGNAME.LNDHUB:
        return await LNDHUB.testConnection(secret);
      default:
        return [false];
    }
  }
}
