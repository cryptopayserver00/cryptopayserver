import { ethers } from 'ethers'
import { CHAINIDS } from '@/packages/constants/blockchain'
import { ERC20Abi } from '../abi/erc20'
import { TRANSACTIONFUNCS } from '../types'
import { RPC } from '../rpc'

/** Post-Glamsterdam: first send to a never-used account needs ~204_600 gas. */
export const EVM_NATIVE_GAS_FLOOR = 250_000
export const EVM_TOKEN_GAS_FLOOR = 350_000
export const EVM_GAS_BUFFER_PCT = 20

export function bufferEvmGas(estimated: number, floor: number): number {
  if (!Number.isFinite(estimated) || estimated <= 0) return floor
  const buffered = Math.ceil(estimated * (1 + EVM_GAS_BUFFER_PCT / 100))
  return Math.max(buffered, floor)
}

export function isEvmTokenContract(contractAddress?: string | null): boolean {
  const addr = String(contractAddress || '').trim()
  return !!addr && addr !== 'undefined' && addr !== 'null' && ethers.isAddress(addr)
}

export function encodeErc20Transfer(to: string, amount: bigint): string {
  const iface = new ethers.Interface(ERC20Abi)
  return iface.encodeFunctionData('transfer', [to, amount])
}

export function toEvmQuantityWei(humanOrWei: string, decimals = 18): string {
  const raw = String(humanOrWei || '0').trim()
  if (!raw) return '0x0'
  // Already hex quantity
  if (raw.startsWith('0x') || raw.startsWith('0X')) return ethers.toQuantity(raw)
  // Already integer wei (no decimal point, large)
  if (/^\d+$/.test(raw) && raw.length > 18) {
    try {
      return ethers.toQuantity(BigInt(raw))
    } catch {
      /* fall through */
    }
  }
  try {
    return ethers.toQuantity(ethers.parseUnits(raw, decimals))
  } catch {
    return '0x1'
  }
}

export async function estimateEvmGas(
  chainIds: CHAINIDS,
  txParams: {
    from?: string
    to?: string
    value?: string
    data?: string
  }
): Promise<number> {
  const call: Record<string, string> = {}
  if (txParams.from) call.from = txParams.from
  if (txParams.to) call.to = txParams.to
  if (txParams.value !== undefined && txParams.value !== '') call.value = txParams.value
  if (txParams.data) call.data = txParams.data

  const response = await RPC.callRPC(chainIds, TRANSACTIONFUNCS.EstimateGas, [call])
  if (!response?.result) {
    throw new Error('can not estimate gas')
  }
  const gasLimit = parseInt(response.result, 16)
  if (!Number.isFinite(gasLimit) || gasLimit <= 0) {
    throw new Error('can not estimate gas')
  }
  return gasLimit
}

/**
 * Estimate gas for a native transfer or ERC-20 transfer.
 * `to` is always the recipient address (not the token contract).
 */
export async function resolveEvmGasLimit(opts: {
  chainIds: CHAINIDS
  from: string
  to: string
  value: string
  contractAddress?: string | null
  decimals?: number
}): Promise<number> {
  const decimals = opts.decimals ?? 18
  const isToken = isEvmTokenContract(opts.contractAddress)

  try {
    if (isToken) {
      let amount: bigint
      try {
        amount = ethers.parseUnits(String(opts.value || '0'), decimals)
      } catch {
        amount = BigInt(1)
      }
      const data = encodeErc20Transfer(opts.to, amount)
      const estimated = await estimateEvmGas(opts.chainIds, {
        from: opts.from,
        to: opts.contractAddress as string,
        value: '0x0',
        data,
      })
      return bufferEvmGas(estimated, EVM_TOKEN_GAS_FLOOR)
    }

    const estimated = await estimateEvmGas(opts.chainIds, {
      from: opts.from,
      to: opts.to,
      value: toEvmQuantityWei(opts.value, decimals),
    })
    return bufferEvmGas(estimated, EVM_NATIVE_GAS_FLOOR)
  } catch (e) {
    console.error(e)
    return isToken ? EVM_TOKEN_GAS_FLOOR : EVM_NATIVE_GAS_FLOOR
  }
}
