import * as bitcoin from 'bitcoinjs-lib';
import { CHAINIDS, CHAINS, COINS } from 'packages/constants/blockchain';
import {
  AssetBalance,
  BTCFeeRate,
  BTCTYPE,
  ChainAccountType,
  SendTransaction,
  TransactionDetail,
  TRANSACTIONSTATUS,
  TRANSACTIONTYPE,
  UnspentTransactionOutput,
} from '../types';
import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { ECPairFactory } from 'ecpair';
import axios from 'axios';
import { BigAdd, BigSub, BigDiv, BigMul } from 'utils/number';
import { ethers } from 'ethers';
import Big from 'big.js';
import { GetBlockchainTxUrl, GetNodeApi } from 'utils/chain/btc';

export class BTC {
  static chain = CHAINS.BITCOIN;

  static axiosInstance = axios.create({
    timeout: 10000,
  });

  static getNetwork(isMainnet: boolean): bitcoin.Network {
    return isMainnet ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
  }

  static getChainIds(isMainnet: boolean): CHAINIDS {
    return isMainnet ? CHAINIDS.BITCOIN : CHAINIDS.BITCOIN_TESTNET;
  }

  static getType(note: string): BTCTYPE {
    switch (note) {
      case 'NATIVESEGWIT':
        return BTCTYPE.NATIVESEGWIT;
      case 'NESTEDSEGWIT':
        return BTCTYPE.NESTEDSEGWIT;
      case 'TAPROOT':
        return BTCTYPE.TAPROOT;
      case 'LEGACY':
        return BTCTYPE.LEGACY;
      default:
        throw new Error('Not suuport the BTCTYPE');
    }
  }

  // For the wallet
  // Four type support: Native Segwit, Nested Segwit, Taproot, Legacy
  static createAccountBySeed(isMainnet: boolean, seed: Buffer): ChainAccountType[] {
    bitcoin.initEccLib(ecc);

    let accounts: Array<ChainAccountType> = [];

    const nativeSegwitPath = isMainnet ? `m/84'/0'/0'/0/0` : `m/84'/1'/0'/0/0`;
    const nestedSegwitPath = isMainnet ? `m/49'/0'/0'/0/0` : `m/49'/1'/0'/0/0`;
    const taprootPath = isMainnet ? `m/86'/0'/0'/0/0` : `m/86'/1'/0'/0/0`;
    const legacyPath = isMainnet ? `m/44'/0'/0'/0/0` : `m/44'/1'/0'/0/0`;

    try {
      const bip32 = BIP32Factory(ecc);
      const node = bip32.fromSeed(seed, this.getNetwork(isMainnet));

      // nativeSegwit
      const nativeSegwitPrivateKey = node.derivePath(nativeSegwitPath).privateKey?.toString('hex');
      const nativeSegwitAddress = this.getAddressP2wpkhFromPrivateKey(isMainnet, nativeSegwitPrivateKey as string);

      accounts.push({
        chain: this.chain,
        address: nativeSegwitAddress as string,
        privateKey: nativeSegwitPrivateKey,
        note: BTCTYPE.NATIVESEGWIT,
        isMainnet: isMainnet,
      });

      // nestedSegwit
      const nestedSegwitPrivateKey = node.derivePath(nestedSegwitPath).privateKey?.toString('hex');
      const nestedSegwitAddress = this.getAddressP2shP2wpkhFromPrivateKey(isMainnet, nestedSegwitPrivateKey as string);

      accounts.push({
        chain: this.chain,
        address: nestedSegwitAddress as string,
        privateKey: nestedSegwitPrivateKey,
        note: BTCTYPE.NESTEDSEGWIT,
        isMainnet: isMainnet,
      });

      // taproot
      const taprootPrivateKey = node.derivePath(taprootPath).privateKey?.toString('hex');
      const taprootAddress = this.getAddressP2trFromPrivateKey(isMainnet, taprootPrivateKey as string);

      accounts.push({
        chain: this.chain,
        address: taprootAddress as string,
        privateKey: taprootPrivateKey,
        note: BTCTYPE.TAPROOT,
        isMainnet: isMainnet,
      });

      // legacy
      const legacyPrivateKey = node.derivePath(legacyPath).privateKey?.toString('hex');
      const legacyAddress = this.getAddressP2pkhFromPrivateKey(isMainnet, legacyPrivateKey as string);

      accounts.push({
        chain: this.chain,
        address: legacyAddress as string,
        privateKey: legacyPrivateKey,
        note: BTCTYPE.LEGACY,
        isMainnet: isMainnet,
      });

      return accounts;
    } catch (e) {
      console.error(e);
      throw new Error('can not create a wallet of btc');
    }
  }

  static createAccountByPrivateKey(isMainnet: boolean, privateKey: string): Array<ChainAccountType> {
    try {
      let accounts: Array<ChainAccountType> = [];

      // nativeSegwit
      const nativeSegwitAddress = this.getAddressP2wpkhFromPrivateKey(isMainnet, privateKey);

      accounts.push({
        chain: this.chain,
        address: nativeSegwitAddress as string,
        privateKey: privateKey,
        note: 'Native Segwit',
        isMainnet: isMainnet,
      });

      // nestedSegwit
      const nestedSegwitAddress = this.getAddressP2shP2wpkhFromPrivateKey(isMainnet, privateKey);

      accounts.push({
        chain: this.chain,
        address: nestedSegwitAddress as string,
        privateKey: privateKey,
        note: 'Nested Segwit',
        isMainnet: isMainnet,
      });

      // taproot
      const taprootAddress = this.getAddressP2trFromPrivateKey(isMainnet, privateKey);

      accounts.push({
        chain: this.chain,
        address: taprootAddress as string,
        privateKey: privateKey,
        note: 'Taproot',
        isMainnet: isMainnet,
      });

      // legacy
      const legacyAddress = this.getAddressP2pkhFromPrivateKey(isMainnet, privateKey);

      accounts.push({
        chain: this.chain,
        address: legacyAddress as string,
        privateKey: privateKey,
        note: 'Legacy',
        isMainnet: isMainnet,
      });

      return accounts;
    } catch (e) {
      console.error(e);
      throw new Error('can not create a wallet of btc');
    }
  }

  static toWifStaring(isMainnet: boolean, privateKey: string): string {
    const ECPair = ECPairFactory(ecc);
    const privateKeyBytes = Buffer.from(privateKey, 'hex');
    const keyPair = ECPair.fromPrivateKey(privateKeyBytes, { network: this.getNetwork(isMainnet) });
    return keyPair.toWIF();
  }

  // p2wpkh
  static getAddressP2wpkhFromPrivateKey(isMainnet: boolean, privateKey: string): string {
    const ECPair = ECPairFactory(ecc);
    const keyPair = ECPair.fromWIF(this.toWifStaring(isMainnet, privateKey), this.getNetwork(isMainnet));
    const p2wpkh = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network: this.getNetwork(isMainnet) });
    return p2wpkh.address as string;
  }

  // p2sh-p2wpkh
  static getAddressP2shP2wpkhFromPrivateKey(isMainnet: boolean, privateKey: string): string {
    const ECPair = ECPairFactory(ecc);
    const keyPair = ECPair.fromWIF(this.toWifStaring(isMainnet, privateKey), this.getNetwork(isMainnet));
    const p2 = bitcoin.payments.p2sh({
      redeem: bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network: this.getNetwork(isMainnet) }),
      network: this.getNetwork(isMainnet),
    });
    return p2.address as string;
  }

  // p2tr
  static getAddressP2trFromPrivateKey(isMainnet: boolean, privateKey: string): string {
    const ECPair = ECPairFactory(ecc);
    const keyPair = ECPair.fromWIF(this.toWifStaring(isMainnet, privateKey), this.getNetwork(isMainnet));
    const p2tr = bitcoin.payments.p2tr({
      internalPubkey: keyPair.publicKey.subarray(1, 33),
      network: this.getNetwork(isMainnet),
    });

    return p2tr.address as string;
  }

  // p2pkh
  static getAddressP2pkhFromPrivateKey(isMainnet: boolean, privateKey: string): string {
    const ECPair = ECPairFactory(ecc);
    const keyPair = ECPair.fromWIF(this.toWifStaring(isMainnet, privateKey), this.getNetwork(isMainnet));
    const p2pkh = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: this.getNetwork(isMainnet) });
    p2pkh.output;
    return p2pkh.address as string;
  }

  // For the transaction
  static checkAddress(isMainnet: boolean, address: string): boolean {
    try {
      bitcoin.address.toOutputScript(address, this.getNetwork(isMainnet));
      return true;
    } catch (e) {
      return false;
    }
  }

  static checkQRCodeText(text: string): boolean {
    const regex = /bitcoin:(\w+)\?amount=([\d.]+)/;
    try {
      const matchText = text.match(regex);
      if (matchText) {
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  static parseQRCodeText(text: string): any {
    const regex = /bitcoin:(\w+)\?amount=([\d.]+)/;

    try {
      const matchText = text.match(regex);
      if (matchText) {
        const address = matchText[1];
        const amount = matchText[2] || 0;

        return {
          address,
          amount,
        };
      } else {
        return;
      }
    } catch (e) {
      console.error(e);
      return;
    }
  }

  static async getAssetBalance(isMainnet: boolean, address: string, toBTC: boolean = true): Promise<AssetBalance> {
    let items = {} as AssetBalance;
    items.BTC = await this.getBalance(isMainnet, address, toBTC);
    return items;
  }

  static async getBalance(isMainnet: boolean, address: string, toBTC: boolean = true): Promise<string> {
    try {
      const url = `${GetNodeApi(isMainnet)}/address/${address}/utxo`;
      const response = await this.axiosInstance.get(url);

      if (response && response.data && response.data.length > 0) {
        let balance = '0';
        response.data.forEach((utxo: any) => {
          if (utxo.status.confirmed) {
            balance = BigAdd(balance, parseInt(utxo.value).toString());
          }
        });

        return toBTC ? BigDiv(balance, '100000000') : balance;
      }

      return '0';
    } catch (e) {
      console.error(e);
      throw new Error('can not get the balance of btc');
    }
  }

  static async getAddressUtxo(isMainnet: boolean, address: string): Promise<UnspentTransactionOutput[]> {
    try {
      const url = `${GetNodeApi(isMainnet)}/address/${address}/utxo`;
      const response = await this.axiosInstance.get(url);

      if (response.data.length > 0) {
        return response.data.map((utxo: any) => {
          if (utxo.status.confirmed) {
            return {
              txid: utxo.txid,
              vout: utxo.vout,
              value: utxo.value,
            };
          }
        });
      }

      return [];
    } catch (e) {
      console.error(e);
      throw new Error('can not get the utxo of btc');
    }
  }

  static async getCurrentFeeRate(isMainnet: boolean): Promise<BTCFeeRate> {
    try {
      const url = `${GetNodeApi(isMainnet)}/v1/fees/recommended`;
      const response = await this.axiosInstance.get(url);
      if (response.data) {
        return {
          fastest: parseInt(response.data.fastestFee),
          halfHour: parseInt(response.data.halfHourFee),
          hour: parseInt(response.data.hourFee),
          economy: parseInt(response.data.economyFee),
          minimum: parseInt(response.data.minimumFee),
        };
      }
      throw new Error('can not get the fee rate of btc');
    } catch (e) {
      console.error(e);
      throw new Error('can not get the fee rate of btc');
    }
  }

  static async broadcastTransaction(isMainnet: boolean, data: string): Promise<string> {
    try {
      const url = `${GetNodeApi(isMainnet)}/tx`;
      const response = await this.axiosInstance.post(url, data);

      if (response.data) {
        return response.data;
      }

      throw new Error('can not broadcast tx of btc');
    } catch (e) {
      console.error(e);
      throw new Error('can not broadcast tx of btc');
    }
  }

  static async getTransactions(isMainnet: boolean, address: string): Promise<TransactionDetail[]> {
    try {
      const url = `${GetNodeApi(isMainnet)}/address/${address}/txs`;
      const response = await this.axiosInstance.get(url);
      if (response.data.length > 0) {
        let txs: TransactionDetail[] = [];
        response.data.forEach((item: any) => {
          let status = TRANSACTIONSTATUS.PENDING;
          if (item.status.confirmed) {
            status = TRANSACTIONSTATUS.SUCCESS;
          }

          let txType = TRANSACTIONTYPE.SEND;
          let value = 0;
          item.vin.forEach((vinItem: any) => {
            if (
              vinItem.prevout.scriptpubkey_address &&
              address.toLowerCase() === vinItem.prevout.scriptpubkey_address.toLowerCase()
            ) {
              txType = TRANSACTIONTYPE.SEND;
              value += parseInt(vinItem.prevout.value);
            } else {
              txType = TRANSACTIONTYPE.RECEIVED;
            }
          });

          item.vout.forEach((voutItem: any) => {
            if (txType === TRANSACTIONTYPE.SEND) {
              if (
                voutItem.scriptpubkey_address &&
                address.toLowerCase() !== voutItem.scriptpubkey_address.toLowerCase()
              ) {
                value -= parseInt(voutItem.value);
              }
            } else if (txType === TRANSACTIONTYPE.RECEIVED) {
              if (
                voutItem.scriptpubkey_address &&
                address.toLowerCase() === voutItem.scriptpubkey_address.toLowerCase()
              ) {
                value += parseInt(voutItem.value);
              }
            }
          });

          let blockTimestamp = 0,
            blockNumber = 0;
          if (item.status.confirmed) {
            blockTimestamp = item.status.block_time;
            blockNumber = item.status.block_height;
          }

          const url = GetBlockchainTxUrl(isMainnet, item.txid);

          txs.push({
            hash: item.txid,
            value: value.toString(),
            asset: COINS.BTC,
            fee: item.fee,
            type: txType,
            status: status,
            blockTimestamp: blockTimestamp,
            blockNumber: blockNumber,
            url: url,
          });
        });

        return txs;
      } else {
        return [];
      }
    } catch (e) {
      console.error(e);
      throw new Error('can not get the transactions of btc');
    }
  }

  static async getTransactionDetail(isMainnet: boolean, hash: string, address?: string): Promise<TransactionDetail> {
    try {
      const url = `${GetNodeApi(isMainnet)}/tx/${hash}`;
      const response = await this.axiosInstance.get(url);
      if (response.data) {
        let status = TRANSACTIONSTATUS.PENDING;
        if (response.data.status.confirmed) {
          status = TRANSACTIONSTATUS.SUCCESS;
        }

        let txType;
        let value = 0;

        if (address) {
          response.data.vin.forEach((vinItem: any) => {
            if (
              vinItem.prevout.scriptpubkey_address &&
              address.toLowerCase() === vinItem.prevout.scriptpubkey_address.toLowerCase()
            ) {
              txType = TRANSACTIONTYPE.SEND;
              value += parseInt(vinItem.prevout.value);
            }
          });

          if (txType !== TRANSACTIONTYPE.SEND) {
            txType = TRANSACTIONTYPE.RECEIVED;
          }

          response.data.vout.forEach((voutItem: any) => {
            if (
              voutItem.scriptpubkey_address &&
              address.toLowerCase() === voutItem.scriptpubkey_address.toLowerCase()
            ) {
              value -= parseInt(voutItem.value);
            }
          });
        }

        let blockTimestamp = 0,
          blockNumber = 0;
        if (response.data.status.confirmed) {
          blockTimestamp = response.data.status.block_time;
          blockNumber = response.data.status.block_height;
        }

        const explorerUrl = GetBlockchainTxUrl(isMainnet, response.data.txid);

        if (address) {
          return {
            hash: response.data.txid,
            value: value.toString(),
            asset: COINS.BTC,
            fee: response.data.fee,
            type: txType,
            status: status,
            blockTimestamp: blockTimestamp,
            blockNumber: blockNumber,
            url: explorerUrl,
          };
        } else {
          return {
            hash: response.data.txid,
            asset: COINS.BTC,
            fee: response.data.fee,
            status: status,
            blockTimestamp: blockTimestamp,
            blockNumber: blockNumber,
            url: explorerUrl,
          };
        }
      }

      throw new Error('can not get the transaction of btc');
    } catch (e) {
      console.error(e);
      throw new Error('can not get the transaction of btc');
    }
  }

  static async sendTransaction(isMainnet: boolean, req: SendTransaction): Promise<string> {
    try {
      const ECPair = ECPairFactory(ecc);
      const keyPair = ECPair.fromWIF(this.toWifStaring(isMainnet, req.privateKey), this.getNetwork(isMainnet));

      let script, redeemScript: Buffer;
      switch (req.btcType) {
        case BTCTYPE.NATIVESEGWIT:
          const p2wpkh = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network: this.getNetwork(isMainnet) });
          script = p2wpkh.output as Buffer;
          redeemScript = p2wpkh.redeem?.output as Buffer;
        case BTCTYPE.NESTEDSEGWIT:
          const p2 = bitcoin.payments.p2sh({
            redeem: bitcoin.payments.p2wpkh({ m: 2, pubkey: keyPair.publicKey, network: this.getNetwork(isMainnet) }),
            network: this.getNetwork(isMainnet),
          });
          script = p2.output as Buffer;
          redeemScript = p2.redeem?.output as Buffer;
          break;
        case BTCTYPE.TAPROOT:
          const p2tr = bitcoin.payments.p2tr({
            internalPubkey: keyPair.publicKey.subarray(1, 33),
            network: this.getNetwork(isMainnet),
          });
          script = p2tr.output as Buffer;
          redeemScript = p2tr.redeem?.output as Buffer;
          break;
        case BTCTYPE.LEGACY:
          const p2pkh = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: this.getNetwork(isMainnet) });
          script = p2pkh.output as Buffer;
          redeemScript = p2pkh.redeem?.output as Buffer;
          break;
        default:
          throw new Error('can not create the transactions of btc');
      }

      const txb = new bitcoin.Psbt({ network: this.getNetwork(isMainnet) });
      txb.setVersion(2);
      txb.setLocktime(0);

      let totalBalance = '0';
      const utxos = await this.getAddressUtxo(isMainnet, req.from);
      utxos &&
        utxos.length > 0 &&
        utxos.forEach((item, index) => {
          totalBalance = BigAdd(totalBalance, item.value.toString());
          txb.addInput({
            hash: item.txid,
            index: item.vout,
            witnessUtxo: {
              script: script,
              value: item.value,
            },
            redeemScript: redeemScript,
            // tapScriptSig: undefined,
            // finalScriptSig: undefined
            // witnessScript: undefined,
          });
        });

      const sendBalance = new Big(ethers.parseUnits(req.value, 8).toString()).toNumber();
      txb.addOutput({
        address: req.to,
        value: sendBalance,
      });

      // feeRate * vSize
      const feeRate = req.feeRate ? req.feeRate : (await this.getCurrentFeeRate(isMainnet)).fastest;
      // const size = txb.extractTransaction().virtualSize() + 90;
      // const size = 200 + 90;
      const size = 1000;
      const feeBalance = BigMul(size.toString(), feeRate.toString());

      const remainValue = parseFloat(BigSub(BigSub(totalBalance, sendBalance.toString()), feeBalance));
      if (remainValue < 0) {
        throw new Error('can not create the transactions of btc');
      }

      txb.addOutput({
        address: req.from,
        value: remainValue,
      });

      txb.signAllInputs(keyPair);
      txb.finalizeAllInputs();

      const tx = txb.extractTransaction();
      const txid = await this.broadcastTransaction(isMainnet, tx.toHex());
      return txid;
    } catch (e) {
      console.error(e);
      throw new Error('can not create the transactions of btc');
    }
  }
}
