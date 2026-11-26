import { useEffect } from 'react'
import { FileKey2, HardDrive, ShieldOff } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { useStorePresistStore, useWalletPresistStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import { WalletOptionCard, WalletSetupLayout } from '../WalletSetupLayout'

const IMPORT_STEPS = ['Choose', 'Import', 'Secure']

const WalletImport = () => {
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
    if (isWallet) {
      router.push('/dashboard')
    }
  }, [isStore, isWallet, router])

  return (
    <WalletSetupLayout
      title="Import your wallet"
      description="Choose how you want to restore an existing wallet into this store."
      steps={IMPORT_STEPS}
      currentStep={2}
      backHref="/wallet/create"
    >
      <div className="space-y-3">
        <WalletOptionCard
          recommended
          title="Mnemonic phrase or private key"
          description="Paste your recovery phrase or import a private key. This is the supported path today."
          icon={<FileKey2 className="h-5 w-5" />}
          onClick={() => router.push('/wallet/import/mnemonicphrase')}
        />

        <div className="space-y-3 pt-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Coming soon
          </p>
          <WalletOptionCard
            disabled
            badge="Soon"
            title="Hardware wallet"
            description="Connect Ledger, Trezor, and similar devices without exposing keys to the server."
            icon={<HardDrive className="h-5 w-5" />}
          />
          <WalletOptionCard
            disabled
            badge="Soon"
            title="Watch-only wallet"
            description="Track balances with a public address or xpub — no private keys required."
            icon={<ShieldOff className="h-5 w-5" />}
          />
        </div>
      </div>
    </WalletSetupLayout>
  )
}

export default WalletImport
