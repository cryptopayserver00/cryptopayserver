import { FormatCryptoAmount, BigDiv } from '@/utils/number'
import {
  TransactionDetail,
  TRANSACTIONSTATUS,
  TRANSACTIONTYPE,
} from '../types'

/** Esplora/mempool APIs return amounts in satoshis — convert to coin units for UI. */
export function satsToCoin(sats: string | number | null | undefined): string {
  try {
    return FormatCryptoAmount(BigDiv(String(sats ?? 0), '100000000'), 8)
  } catch {
    return '0'
  }
}

/**
 * Net transfer for an address from an Esplora-style tx.
 * Send = sum of outputs to others; Received = sum of outputs to self.
 */
export function summarizeAddressTx(
  address: string,
  item: { vin?: any[]; vout?: any[] }
): { type: TRANSACTIONTYPE; valueCoin: string } {
  const addr = address.toLowerCase()
  let isSend = false
  for (const vin of item.vin || []) {
    const from = vin?.prevout?.scriptpubkey_address
    if (from && String(from).toLowerCase() === addr) {
      isSend = true
      break
    }
  }

  let sats = 0
  for (const vout of item.vout || []) {
    const to = vout?.scriptpubkey_address
    if (!to) continue
    const mine = String(to).toLowerCase() === addr
    const v = Number(vout.value)
    if (!Number.isFinite(v)) continue
    if (isSend && !mine) sats += v
    if (!isSend && mine) sats += v
  }

  return {
    type: isSend ? TRANSACTIONTYPE.SEND : TRANSACTIONTYPE.RECEIVED,
    valueCoin: satsToCoin(sats),
  }
}

export function mapEsploraTxToDetail(
  address: string,
  item: any,
  asset: string,
  explorerTxUrl: (txid: string) => string
): TransactionDetail | null {
  if (!item?.txid) return null
  const confirmed = Boolean(item?.status?.confirmed)
  const { type, valueCoin } = summarizeAddressTx(address, item)
  return {
    hash: item.txid,
    value: valueCoin,
    asset,
    fee: satsToCoin(item.fee),
    type,
    status: confirmed ? TRANSACTIONSTATUS.SUCCESS : TRANSACTIONSTATUS.PENDING,
    blockTimestamp: confirmed ? Number(item.status?.block_time || 0) : 0,
    blockNumber: confirmed ? Number(item.status?.block_height || 0) : 0,
    url: explorerTxUrl(item.txid),
  }
}

/** Merge confirmed+mempool lists; pending first; dedupe by hash. */
export function mergeEsploraTxDetails(rows: TransactionDetail[]): TransactionDetail[] {
  const seen = new Map<string, TransactionDetail>()
  for (const row of rows) {
    const key = String(row.hash || '').toLowerCase()
    if (!key) continue
    const prev = seen.get(key)
    if (!prev) {
      seen.set(key, row)
      continue
    }
    // Prefer confirmed over pending when the same hash appears twice.
    if (
      prev.status !== TRANSACTIONSTATUS.SUCCESS &&
      row.status === TRANSACTIONSTATUS.SUCCESS
    ) {
      seen.set(key, row)
    }
  }
  return Array.from(seen.values()).sort((a, b) => {
    const aPend = a.status !== TRANSACTIONSTATUS.SUCCESS
    const bPend = b.status !== TRANSACTIONSTATUS.SUCCESS
    if (aPend !== bPend) return aPend ? -1 : 1
    return Number(b.blockTimestamp || 0) - Number(a.blockTimestamp || 0)
  })
}
