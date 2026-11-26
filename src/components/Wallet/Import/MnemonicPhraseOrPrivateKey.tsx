import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStorePresistStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import { WalletSetupLayout } from '../WalletSetupLayout'
import ImportMnemonicPhrase from './MnemonicPhrase'
import ImportPrivateKey from './PrivateKey'

const IMPORT_STEPS = ['Choose', 'Import', 'Secure']

const ImportMnemonicPhraseOrPrivateKey = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('mnemonic')

  const { isStore } = useStorePresistStore(
    useShallow((state) => ({
      isStore: state.isStore,
    }))
  )

  useEffect(() => {
    if (!isStore) {
      router.push('/stores/create')
    }
  }, [isStore, router])

  return (
    <WalletSetupLayout
      title="Restore wallet secrets"
      description="Enter your mnemonic phrase or private key carefully. Spaces and order matter."
      steps={IMPORT_STEPS}
      currentStep={2}
      backHref="/wallet/import"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-5">
        <TabsList>
          <TabsTrigger value="mnemonic">Mnemonic phrase</TabsTrigger>
          <TabsTrigger value="private-key">Private key</TabsTrigger>
        </TabsList>

        <TabsContent value="mnemonic" className="mt-0">
          <ImportMnemonicPhrase />
        </TabsContent>
        <TabsContent value="private-key" className="mt-0">
          <ImportPrivateKey />
        </TabsContent>
      </Tabs>
    </WalletSetupLayout>
  )
}

export default ImportMnemonicPhraseOrPrivateKey
