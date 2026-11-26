import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { HardDrive, Loader2, Sparkles } from 'lucide-react'

import {
  useSnackPresistStore,
  useStorePresistStore,
  useUserPresistStore,
  useWalletPresistStore,
} from '@/lib/store'
import axios from '@/utils/http/axios'
import { getApiErrorMessage } from '@/utils/http/api-error'
import { Http } from '@/utils/http/http'
import { useShallow } from 'zustand/react/shallow'
import { WalletOptionCard, WalletSetupLayout } from './WalletSetupLayout'

const CREATE_STEPS = ['Choose', 'Create', 'Secure', 'Backup']

const GenerateWallet = () => {
  const router = useRouter()
  const [creating, setCreating] = useState(false)

  const { userId } = useUserPresistStore(
    useShallow((state) => ({
      userId: state.userId,
    }))
  )

  const { storeId, isStore } = useStorePresistStore(
    useShallow((state) => ({
      storeId: state.storeId,
      isStore: state.isStore,
    }))
  )

  const { isWallet, setWalletId, setIsWallet } = useWalletPresistStore(
    useShallow((state) => ({
      isWallet: state.isWallet,
      setWalletId: state.setWalletId,
      setIsWallet: state.setIsWallet,
    }))
  )

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      setSnackSeverity: state.setSnackSeverity,
      setSnackMessage: state.setSnackMessage,
      setSnackOpen: state.setSnackOpen,
    }))
  )

  const showSnack = (severity: 'success' | 'error' | 'warning', message: string) => {
    setSnackSeverity(severity)
    setSnackMessage(message)
    setSnackOpen(true)
  }

  const walletToBlockScan = async (walletId: string | number) => {
    try {
      const response: any = await axios.post(Http.create_wallet_to_block_scan, {
        user_id: userId,
        wallet_id: walletId,
      })
      if (!response.result) {
        showSnack('error', 'Some addresses could not join block scanning. You can retry later.')
      }
    } catch (e) {
      showSnack('error', 'Some addresses could not join block scanning. You can retry later.')
      console.error(e)
    }
  }

  const onClickMnemonicPhrase = async () => {
    if (creating) return

    try {
      setCreating(true)

      const existing: any = await axios.get(Http.find_wallet, {
        params: { store_id: storeId },
      })

      if (existing.result) {
        setWalletId(existing.data.id)
        setIsWallet(true)
        showSnack('success', 'This store already has a wallet')
        router.push('/dashboard')
        return
      }

      const { promptAccountPassword } = await import('@/utils/wallet-password')
      const accountPassword = await promptAccountPassword(
        'Enter your account password to create wallet'
      )
      if (accountPassword === null) return

      const create_wallet_resp: any = await axios.post(Http.create_wallet, {
        user_id: userId,
        store_id: storeId,
        account_password: accountPassword,
      })

      if (!create_wallet_resp.result) {
        showSnack('error', create_wallet_resp.message || 'Failed to create wallet')
        return
      }

      setWalletId(create_wallet_resp.data.walletId)
      setIsWallet(true)
      showSnack('success', 'Wallet created')
      await walletToBlockScan(create_wallet_resp.data.walletId)
      router.push('/wallet/setPassword')
    } catch (e) {
      showSnack('error', getApiErrorMessage(e))
      console.error(e)
    } finally {
      setCreating(false)
    }
  }

  useEffect(() => {
    if (!isStore) {
      router.push('/stores/create')
      return
    }
    if (isWallet) {
      router.push('/dashboard')
    }
  }, [isStore, isWallet, router])

  return (
    <WalletSetupLayout
      title="Create a new wallet"
      description="We’ll generate a mnemonic phrase for this store. Next you’ll set a wallet password and back up the phrase."
      steps={CREATE_STEPS}
      currentStep={2}
      backHref="/wallet/create"
      footer={
        <p className="text-center text-xs text-muted-foreground">
          Continuing implies agreeing to CryptoPayServer{' '}
          <Link
            href="https://docs.cryptopayserver.online"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            user agreement
          </Link>
          .
        </p>
      }
    >
      <div className="space-y-3">
        <WalletOptionCard
          recommended
          title={creating ? 'Creating wallet...' : 'Generate mnemonic phrase'}
          description="One phrase covers Bitcoin, Lightning-ready chains, EVM, Solana, Tron, TON, XRP, and more."
          icon={
            creating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )
          }
          onClick={onClickMnemonicPhrase}
          disabled={creating}
        />
        <WalletOptionCard
          disabled
          badge="Soon"
          title="Hardware wallet"
          description="Generate or connect with a hardware device. Not available yet."
          icon={<HardDrive className="h-5 w-5" />}
        />
      </div>
    </WalletSetupLayout>
  )
}

export default GenerateWallet
