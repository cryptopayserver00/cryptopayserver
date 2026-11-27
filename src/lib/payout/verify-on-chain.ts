import { CHAINS } from '@/packages/constants/blockchain'
import { WEB3 } from '@/packages/web3'
import { TRANSACTIONSTATUS } from '@/packages/web3/types'
import { BigAlmostEqual, BigIsPositive } from '@/utils/number'

function addressesMatch(a: string, b: string): boolean {
  return a === b || a.toLowerCase() === b.toLowerCase()
}

/**
 * Verify a payout settlement tx on-chain.
 * SUCCESS + matching destination/amount/asset → ok.
 * PENDING / sparse explorer data → not_found (keep InProgress).
 * Wrong destination/amount/asset → mismatch (reject).
 */
export async function verifyPayoutOnChain(opts: {
  chainId: number
  network: number
  txHash: string
  destination: string
  crypto: string
  expectedAmount?: number | string | null
}): Promise<{ ok: true } | { ok: false; reason: 'not_found' | 'mismatch' }> {
  let detail: Awaited<ReturnType<typeof WEB3.getTransactionDetail>> | null = null
  try {
    detail = await WEB3.getTransactionDetail(
      opts.network === 1,
      opts.chainId as CHAINS,
      opts.txHash
    )
  } catch {
    return { ok: false, reason: 'not_found' }
  }

  if (!detail?.hash) {
    return { ok: false, reason: 'not_found' }
  }

  if (!detail.to || detail.value === undefined || detail.value === null || detail.value === '') {
    return { ok: false, reason: 'not_found' }
  }

  if (!detail.status || detail.status === TRANSACTIONSTATUS.PENDING) {
    return { ok: false, reason: 'not_found' }
  }
  if (detail.status !== TRANSACTIONSTATUS.SUCCESS) {
    return { ok: false, reason: 'mismatch' }
  }

  if (!addressesMatch(String(detail.to), opts.destination)) {
    return { ok: false, reason: 'mismatch' }
  }

  if (opts.crypto) {
    if (!detail.asset) {
      return { ok: false, reason: 'not_found' }
    }
    if (String(detail.asset).toUpperCase() !== String(opts.crypto).toUpperCase()) {
      return { ok: false, reason: 'mismatch' }
    }
  }

  if (opts.expectedAmount != null && opts.expectedAmount !== '' && BigIsPositive(opts.expectedAmount)) {
    if (detail.value === undefined || detail.value === null || detail.value === '') {
      return { ok: false, reason: 'not_found' }
    }
    // 1e-6 relative tolerance covers explorer rounding without float epsilon hacks.
    if (!BigAlmostEqual(detail.value, opts.expectedAmount, '1e-6', '1e-12')) {
      return { ok: false, reason: 'mismatch' }
    }
  }

  return { ok: true }
}
