import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, Sparkles } from 'lucide-react'

import { useStorePresistStore, useWalletPresistStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import { WalletOptionCard, WalletSetupLayout } from './WalletSetupLayout'

const CREATE_STEPS = ['Choose', 'Create', 'Secure', 'Backup']

const CreateWallet = () => {
  const router = useRouter()

  const { isStore } = useStorePresistStore(
    useShallow((state) => ({
      isStore: state.isStore,
    }))
  )

  const { isWallet } = useWalletPresistStore(
    useShallow((state) => ({
      isWallet: state.isWallet,
    }))
  )

  useEffect(() => {
    if (!isStore) {
      router.push('/stores/create')
      return
    }
    // One wallet per store — don't re-enter create/import after it exists.
    if (isWallet) {
      router.push('/dashboard')
    }
  }, [isStore, isWallet, router])

  return (
    <WalletSetupLayout
      title="Set up your wallet"
      description="Create a new multi-chain wallet for this store, or import one you already control."
      steps={CREATE_STEPS}
      currentStep={1}
      backHref="/dashboard"
      backLabel="Back to dashboard"
    >
      <div className="space-y-3">
        <WalletOptionCard
          recommended
          title="Create a new wallet"
          description="Generate a fresh mnemonic phrase. You’ll set a password and back it up next."
          icon={<Sparkles className="h-5 w-5" />}
          onClick={() => router.push('/wallet/generate')}
        />
        <WalletOptionCard
          title="Import an existing wallet"
          description="Restore from a mnemonic phrase or private key you already have backed up."
          icon={<KeyRound className="h-5 w-5" />}
          onClick={() => router.push('/wallet/import')}
        />
      </div>
    </WalletSetupLayout>
  )
}

export default CreateWallet
