import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'

/**
 * Require a wallet password for sensitive actions.
 * Returns null when the user cancels; throws if no password is configured.
 */
export async function promptWalletPasswordIfNeeded(walletId: number): Promise<string | null> {
  const response: any = await axios.get(Http.find_wallet_by_id, {
    params: { id: walletId },
  })

  if (!response.result) {
    throw new Error(response.message || 'Cannot load wallet')
  }

  if (!response.data?.hasPassword) {
    throw new Error('Set a wallet password before this action')
  }

  const password = window.prompt('Enter your wallet password to continue')
  if (password === null) return null
  if (!password) {
    throw new Error('Wallet password required')
  }
  return password
}

/**
 * Require the account login password (step-up) for send / export / reveal.
 * Returns null when the user cancels.
 */
export function promptAccountPassword(message = 'Enter your account password to continue'): string | null {
  const password = window.prompt(message)
  if (password === null) return null
  if (!password) {
    throw new Error('Account password required')
  }
  return password
}
