import {
  useSnackPresistStore,
  useStorePresistStore,
  useUserPresistStore,
  useWalletPresistStore,
} from '@/lib/store'
import { useEffect, useState } from 'react'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { useShallow } from 'zustand/react/shallow'

const ImportMnemonicPhrase = () => {
  const [bit, setBit] = useState<number>(12)
  const [numbers, setNumbers] = useState<number[]>([])
  const [phrase, setPhrase] = useState<string[]>([])

  const { userId } = useUserPresistStore(
    useShallow((state) => ({
      userId: state.userId,
    }))
  )

  const { setWalletId, setIsWallet } = useWalletPresistStore(
    useShallow((state) => ({
      setWalletId: state.setWalletId,
      setIsWallet: state.setIsWallet,
    }))
  )

  const { storeId, isStore } = useStorePresistStore(
    useShallow((state) => ({
      storeId: state.storeId,
      isStore: state.isStore,
    }))
  )

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      setSnackSeverity: state.setSnackSeverity,
      setSnackMessage: state.setSnackMessage,
      setSnackOpen: state.setSnackOpen,
    }))
  )

  const handleBitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBit(Number(e.target.value))
  }

  const handlePhraseChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newPhrase = [...phrase]
    newPhrase[index - 1] = e.target.value
    setPhrase(newPhrase)
  }

  const handleButtonClick = async () => {
    if (!phrase || phrase.filter((element) => element).length !== bit) {
      setSnackSeverity('error')
      setSnackMessage('The input cannot be empty')
      setSnackOpen(true)
      return
    }

    try {
      const response: any = await axios.get(Http.find_wallet, {
        params: {
          store_id: storeId,
        },
      })

      if (response.result) {
        setWalletId(response.data.id)
        setIsWallet(true)

        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 2000)
        return
      }

      const import_wallet_resp: any = await axios.post(Http.save_wallet, {
        import_wallet: phrase.join(' '),
        store_id: storeId,
        user_id: userId,
      })

      if (import_wallet_resp.result) {
        setWalletId(import_wallet_resp.data.walletId)
        setIsWallet(true)
        setSnackSeverity('success')
        setSnackMessage('Successful creation!')
        setSnackOpen(true)

        await walletToBlockScan(import_wallet_resp.data.walletId)

        setTimeout(() => {
          window.location.href = '/wallet/setPassword'
        }, 2000)
      } else {
        setSnackSeverity('error')
        setSnackMessage('No support the wallet')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('No support the wallet')
      setSnackOpen(true)
      console.error(e)
    }
  }

  const walletToBlockScan = async (walletId: string) => {
    try {
      const response: any = await axios.post(Http.create_wallet_to_block_scan, {
        user_id: userId,
        wallet_id: walletId,
      })

      if (response.result) {
      } else {
        setSnackSeverity('error')
        setSnackMessage('Some addresses cannot join the Sweeping Quest, please try again')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('Some addresses cannot join the Sweeping Quest, please try again')
      setSnackOpen(true)
      console.error(e)
    }
  }

  useEffect(() => {
    const newNumbers = Array.from({ length: bit / 2 }, (_, index) => index)
    setNumbers(newNumbers)
  }, [bit])

  useEffect(() => {
    if (!isStore) {
      window.location.href = '/stores/create'
    }
  }, [isStore])

  return (
    <div className="p-4">
      <div className="flex items-center space-x-3 mb-6">
        <span className="text-gray-700 font-medium">My mnemonic phrase is</span>
        <select
          value={bit}
          onChange={handleBitChange}
          className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer shadow-sm"
        >
          <option value={12}>12 bit</option>
          <option value={24}>24 bit</option>
        </select>
      </div>

      <div className="space-y-3">
        {numbers &&
          numbers.map((item) => (
            <div key={item} className="flex items-center space-x-4">
              <div className="relative w-[200px]">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs text-gray-400 font-medium pointer-events-none select-none">
                  {item * 2 + 1}
                </span>
                <input
                  type="text"
                  className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  value={phrase[item * 2] || ''}
                  onChange={(e) => handlePhraseChange(e, item * 2 + 1)}
                />
              </div>

              <div className="relative w-[200px]">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs text-gray-400 font-medium pointer-events-none select-none">
                  {item * 2 + 2}
                </span>
                <input
                  type="text"
                  className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  value={phrase[item * 2 + 1] || ''}
                  onChange={(e) => handlePhraseChange(e, item * 2 + 2)}
                />
              </div>
            </div>
          ))}
      </div>

      <div className="mt-8 w-[416px]">
        <button
          type="button"
          onClick={handleButtonClick}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Confirm
        </button>
      </div>
    </div>
  )
}

export default ImportMnemonicPhrase
