import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { requestSecretPrompt } from '@/lib/store/secret-prompt'

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

  const result = await requestSecretPrompt({
    title: 'Wallet password required',
    description: 'Enter your wallet password to continue.',
    fields: [
      {
        id: 'password',
        label: 'Wallet password',
        type: 'password',
        autoComplete: 'current-password',
      },
    ],
  })
  if (!result) return null
  const password = String(result.password || '')
  if (!password) {
    throw new Error('Wallet password required')
  }
  return password
}

/**
 * Require the account login password (step-up) for send / export / reveal.
 * Returns null when the user cancels.
 */
export async function promptAccountPassword(
  message = 'Enter your account password to continue'
): Promise<string | null> {
  const result = await requestSecretPrompt({
    title: 'Account password required',
    description: message,
    fields: [
      {
        id: 'password',
        label: 'Account password',
        type: 'password',
        autoComplete: 'current-password',
      },
    ],
  })
  if (!result) return null
  const password = String(result.password || '')
  if (!password) {
    throw new Error('Account password required')
  }
  return password
}
