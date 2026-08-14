import { useEffect, useState } from 'react'
import { useStorePresistStore } from '@/lib/store'
import ImportMnemonicPhrase from './MnemonicPhrase'
import ImportPrivateKey from './PrivateKey'
import { useShallow } from 'zustand/react/shallow'

const ImportMnemonicPhraseOrPrivateKey = () => {
  const [activeTab, setActiveTab] = useState<number>(0)

  const { isStore } = useStorePresistStore(
    useShallow((state) => ({
      isStore: state.isStore,
    }))
  )

  useEffect(() => {
    if (!isStore) {
      window.location.href = '/stores/create'
    }
  }, [isStore])

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto flex flex-col pt-10">
        <h1 className="text-3xl font-bold text-gray-900">Mnemonic Phrase Or Private Key</h1>

        <p className="mt-5 text-base text-gray-600">Please select your mnemonic phrase in order</p>

        <div className="mt-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                type="button"
                onClick={() => setActiveTab(0)}
                className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors focus:outline-none ${
                  activeTab === 0
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                role="tab"
                aria-selected={activeTab === 0}
              >
                Mnemonic Phrase
              </button>
              <button
                type="button"
                onClick={() => setActiveTab(1)}
                className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors focus:outline-none ${
                  activeTab === 1
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                role="tab"
                aria-selected={activeTab === 1}
              >
                Private Key
              </button>
            </nav>
          </div>

          <div className="pt-6">
            <div role="tabpanel" hidden={activeTab !== 0} id="tabpanel-0" aria-labelledby="tab-0">
              {activeTab === 0 && <ImportMnemonicPhrase />}
            </div>
            <div role="tabpanel" hidden={activeTab !== 1} id="tabpanel-1" aria-labelledby="tab-1">
              {activeTab === 1 && <ImportPrivateKey />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImportMnemonicPhraseOrPrivateKey
