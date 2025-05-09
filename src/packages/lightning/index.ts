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

  static async authorize(name: LIGHTNINGNAME): Promise<boolean> {
    switch (name) {
      case LIGHTNINGNAME.LNDHUB:
        return await LNDHUB.authorize();
      default:
        return false;
    }
  }
}
