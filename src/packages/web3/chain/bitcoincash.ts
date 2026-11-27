import axios from 'axios'
import { TestNetWallet, Wallet } from 'mainnet-js'
import { CHAINIDS, CHAINS, COINS, INNERCHAINNAMES } from '@/packages/constants/blockchain'
import {
  AssetBalance,
  ChainAccountType,
  QRCodeText,
  SendTransaction,
  TransactionDetail,
  TRANSACTIONSTATUS,
  TRANSACTIONTYPE,
} from '../types'
import { ethers } from 'ethers'
import { FindTokenByChainIdsAndContractAddress } from '@/utils/web3'
import { BigDiv } from '@/utils/number'
import { BLOCKSCAN } from '../block_scan'
import { GetBlockchainTxUrl, GetNodeApi } from '@/utils/chain/bch'
import { mapEsploraTxToDetail, mergeEsploraTxDetails } from './utxo_tx'

export class BITCOINCASH {
  static chain = CHAINS.BITCOINCASH

  // proxy:false — avoid system http_proxy breaking bchexplorer
  static axiosInstance = axios.create({
    timeout: 50000,
    proxy: false,
  })

  /** Compare CashAddr with/without bitcoincash:|bchtest: prefix. */
  static addressEqual(a?: string, b?: string): boolean {
    const norm = (x: string) => {
      let s = String(x || '').trim().toLowerCase()
      const i = s.indexOf(':')
      if (i >= 0) s = s.slice(i + 1)
      return s
    }
    const na = norm(a || '')
    return Boolean(na) && na === norm(b || '')
  }

  static getChainIds(isMainnet: boolean): CHAINIDS {
    return isMainnet ? CHAINIDS.BITCOINCASH : CHAINIDS.BITCOINCASH_TESTNET
  }

  static getChainName(isMainnet: boolean): INNERCHAINNAMES {
    return isMainnet ? INNERCHAINNAMES.BITCOINCASH : INNERCHAINNAMES.BITCOINCASH_TESTNET
  }

  static async createAccountBySeed(
    isMainnet: boolean,
    seed: Buffer,
    mnemonic: string
  ): Promise<ChainAccountType> {
    const path = `m/44'/1'/145'/0/0`

    try {
      let wallet

      if (isMainnet) {
        wallet = await Wallet.fromSeed(mnemonic, path)
      } else {
        wallet = await TestNetWallet.fromSeed(mnemonic, path)
      }

      return {
        chain: this.chain,
        address: wallet.cashaddr as string,
        privateKey: wallet.privateKeyWif,
        note: 'BITCOINCASH',
        isMainnet: isMainnet,
      }
    } catch (e) {
      console.error(e)
      throw new Error('can not create a wallet of bch')
    }
  }

  static async createAccountByPrivateKey(
    isMainnet: boolean,
    privateKey: string
  ): Promise<ChainAccountType> {
    try {
      let wallet

      if (isMainnet) {
        wallet = await Wallet.fromWIF(privateKey)
      } else {
        wallet = await TestNetWallet.fromWIF(privateKey)
      }

      return {
        chain: this.chain,
        address: wallet.cashaddr as string,
        privateKey: privateKey,
        note: 'BITCOINCASH',
        isMainnet: isMainnet,
      }
    } catch (e) {
      console.error(e)
      throw new Error('can not create a wallet of bch')
    }
  }

  static async checkAddress(isMainnet: boolean, address: string): Promise<boolean> {
    try {
      if (isMainnet) {
        await Wallet.watchOnly(address)
      } else {
        await TestNetWallet.watchOnly(address)
      }

      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }

  static checkQRCodeText(text: string): boolean {
    const regex = `^(${this.getChainName(true)}|${this.getChainName(
      false
    )}):([^?]+)(\\?token=([^&]+)&amount=((\\d*\\.?\\d+))|\\?amount=((\\d*\\.?\\d+)))$`

    try {
      const matchText = text.match(regex)
      if (matchText) {
        return true
      }
      return false
    } catch (e) {
      console.error(e)
      return false
    }
  }

  static parseQRCodeText(text: string): QRCodeText {
    const regex = `^(${this.getChainName(true)}|${this.getChainName(
      false
    )}):([^?]+)(\\?token=([^&]+)&amount=((\\d*\\.?\\d+))|\\?amount=((\\d*\\.?\\d+)))$`

    try {
      const matchText = text.match(regex)

      let network = 0
      let networkString = ''
      let address = ''
      let token = ''
      let tokenAddress = ''
      let amount = ''

      if (matchText) {
        networkString = matchText[1]
        address = matchText[2]

        switch (networkString) {
          case INNERCHAINNAMES.BITCOINCASH:
            network = 1
            break
          case INNERCHAINNAMES.BITCOINCASH_TESTNET:
            network = 2
            break
          default:
            throw new Error('Invalid QR code text format')
        }

        amount = matchText[7]
        token = COINS.BCH
      }

      return {
        network,
        networkString,
        address,
        token,
        tokenAddress,
        amount,
      }
    } catch (e) {
      console.error(e)
      return {} as QRCodeText
    }
  }

  static generateQRCodeText(isMainnet: boolean, address: string, amount?: string): string {
    let qrcodeText = `${this.getChainName(isMainnet)}:${address}?`

    amount = amount || '0'

    qrcodeText += `amount=${amount}`

    return qrcodeText
  }

  static async getAssetBalance(
    isMainnet: boolean,
    address: string,
    toBCH: boolean = true
  ): Promise<AssetBalance> {
    let items = {} as AssetBalance
    items.BCH = await this.getBalance(isMainnet, address, toBCH)
    return items
  }

  static async getBalance(
    isMainnet: boolean,
    address: string,
    toBCH: boolean = true
  ): Promise<string> {
    try {
      let wallet

      if (isMainnet) {
        wallet = await Wallet.watchOnly(address)
      } else {
        wallet = await TestNetWallet.watchOnly(address)
      }

      return toBCH
        ? BigDiv((await wallet.getBalance()).toString(), '100000000')
        : (await wallet.getBalance()).toString()
    } catch (e) {
      console.error(e)
      return '0'
    }
  }

  static async getTransactions(isMainnet: boolean, address: string): Promise<TransactionDetail[]> {
    // Mainnet: Esplora (bchexplorer) first — same shape as BTC/LTC.
    const base = GetNodeApi(isMainnet)
    if (base) {
      try {
        const txs = await this.fetchEsploraTransactions(isMainnet, base, address)
        if (txs.length > 0) return txs
        // Empty history is valid; still try node for pending/indexer lag.
      } catch (e) {
        console.warn('[BCH] esplora getTransactions failed', e)
      }
    }

    try {
      if (!BLOCKSCAN.isConfigured) return []
      const url = `${BLOCKSCAN.baseUrl}/node/bch/getTransactions?chain_id=${this.getChainIds(
        isMainnet
      )}&address=${encodeURIComponent(address)}`
      const response = await BLOCKSCAN.axiosInstance.get(url)
      if (response.data.code === 10200 && Array.isArray(response.data.data)) {
        return response.data.data.map((tx: any) => ({
          hash: String(tx.hash || ''),
          asset: String(tx.asset || COINS.BCH || 'BCH'),
          fee: '0',
          value: String(tx.amount || ''),
          type:
            tx.type === 'Send'
              ? TRANSACTIONTYPE.SEND
              : tx.type === 'Received'
                ? TRANSACTIONTYPE.RECEIVED
                : undefined,
          status:
            String(tx.status).toLowerCase() === 'success'
              ? TRANSACTIONSTATUS.SUCCESS
              : String(tx.status).toLowerCase() === 'pending'
                ? TRANSACTIONSTATUS.PENDING
                : TRANSACTIONSTATUS.FAILED,
          blockTimestamp: Number(tx.blockTimestamp || 0),
          url: GetBlockchainTxUrl(isMainnet, String(tx.hash || '')),
        }))
      }
      return []
    } catch (e) {
      console.error(e)
      return []
    }
  }

  private static async fetchEsploraTransactions(
    isMainnet: boolean,
    base: string,
    address: string
  ): Promise<TransactionDetail[]> {
    // CashAddr contains ':'; try raw path (works on bchexplorer) then encoded.
    const candidates = [address, encodeURIComponent(address)]
    let confirmed: any[] = []
    let mempool: any[] = []
    let lastErr: unknown

    for (const addrPath of candidates) {
      try {
        const [confirmedResp, mempoolResp] = await Promise.allSettled([
          this.axiosInstance.get(`${base}/address/${addrPath}/txs`),
          this.axiosInstance.get(`${base}/address/${addrPath}/txs/mempool`),
        ])
        if (confirmedResp.status === 'fulfilled' && Array.isArray(confirmedResp.value.data)) {
          confirmed = confirmedResp.value.data
          if (mempoolResp.status === 'fulfilled' && Array.isArray(mempoolResp.value.data)) {
            mempool = mempoolResp.value.data
          }
          break
        }
        if (confirmedResp.status === 'rejected') lastErr = confirmedResp.reason
      } catch (e) {
        lastErr = e
      }
    }

    if (!confirmed.length && !mempool.length && lastErr) {
      throw lastErr instanceof Error ? lastErr : new Error(String(lastErr))
    }

    // Rewrite scriptpubkey_address for matching when explorer omits cashaddr prefix.
    const normalizeTx = (item: any) => {
      const fix = (a?: string) => a || ''
      return {
        ...item,
        vin: (item.vin || []).map((vin: any) => ({
          ...vin,
          prevout: vin?.prevout
            ? {
                ...vin.prevout,
                scriptpubkey_address: this.addressEqual(vin.prevout.scriptpubkey_address, address)
                  ? address
                  : fix(vin.prevout.scriptpubkey_address),
              }
            : vin?.prevout,
        })),
        vout: (item.vout || []).map((vout: any) => ({
          ...vout,
          scriptpubkey_address: this.addressEqual(vout.scriptpubkey_address, address)
            ? address
            : fix(vout.scriptpubkey_address),
        })),
      }
    }

    const mapped = [...mempool, ...confirmed]
      .map((item) =>
        mapEsploraTxToDetail(address, normalizeTx(item), COINS.BCH, (hash) =>
          GetBlockchainTxUrl(isMainnet, hash)
        )
      )
      .filter(Boolean) as TransactionDetail[]

    return mergeEsploraTxDetails(mapped)
  }

  static async getTransactionDetail(
    isMainnet: boolean,
    hash: string,
    address?: string
  ): Promise<TransactionDetail> {
    try {
      throw new Error('can not get the transaction of bch')
    } catch (e) {
      console.error(e)
      throw new Error('can not get the transaction of bch')
    }
  }

  static async sendTransaction(isMainnet: boolean, req: SendTransaction): Promise<string> {
    if (!req.privateKey || req.privateKey === '') {
      throw new Error('can not get the private key of bch')
    }

    try {
      let wallet, toWalelt

      if (isMainnet) {
        wallet = await Wallet.fromWIF(req.privateKey)

        toWalelt = await Wallet.watchOnly(req.to)
      } else {
        wallet = await TestNetWallet.fromWIF(req.privateKey)

        toWalelt = await TestNetWallet.watchOnly(req.to)
      }

      const txData = await wallet.send({
        cashaddr: toWalelt?.getDepositAddress(),
        // value: Number(req.value),
        value: ethers.parseUnits(req.value, 8),
        // unit: 'bch',
      })

      if (txData) {
        return txData.txId as string
      }

      throw new Error('can not send the transaction of bch')
    } catch (e) {
      console.error(e)
      throw new Error('can not send the transactions of bch')
    }
  }
}
