import { useEffect, useState } from 'react'
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store'
import { CHAINNAMES } from '@/packages/constants/blockchain'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { FindChainIdsByChainNames } from '@/utils/web3'
import { useShallow } from 'zustand/react/shallow'

const ImportPrivateKey = () => {
  const [chainName, setChainName] = useState<CHAINNAMES>(CHAINNAMES.BITCOIN)
  const [privateKey, setPrivateKey] = useState<string>('')

  const { userId, network } = useUserPresistStore(
    useShallow((state) => ({
      userId: state.userId,
      network: state.network,
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

  const onClickBatchImport = () => {
    setSnackMessage('No support right now')
    setSnackSeverity('error')
    setSnackOpen(true)
  }

  const handleButtonClick = async () => {
    try {
      if (!privateKey || privateKey === '') {
        setSnackSeverity('error')
        setSnackMessage('The privateKey cannot be empty')
        setSnackOpen(true)
        return
      }

      if (!chainName || !Object.values(CHAINNAMES).includes(chainName)) {
        setSnackSeverity('error')
        setSnackMessage('The chainName cannot be empty')
        setSnackOpen(true)
        return
      }

      const response: any = await axios.post(Http.save_wallet_by_private_key, {
        user_id: userId,
        store_id: storeId,
        chain_id: FindChainIdsByChainNames(chainName),
        network: network === 'mainnet' ? 1 : 2,
        private_key: privateKey,
      })

      if (response.result) {
        setSnackSeverity('success')
        setSnackMessage('Successful creation!')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  useEffect(() => {
    if (!isStore) {
      window.location.href = '/stores/create'
    }
  }, [isStore])

  return (
    <div className="w-full max-w-[420px]">
      <div className="w-full">
        <label className="sr-only">Select Network</label>
        <select
          aria-label="Without label"
          value={chainName}
          onChange={(e) => setChainName(e.target.value as CHAINNAMES)}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
        >
          {CHAINNAMES &&
            Object.entries(CHAINNAMES).length > 0 &&
            Object.entries(CHAINNAMES).map((item, index) => (
              <option value={item[1]} key={index}>
                {item[1]}
              </option>
            ))}
        </select>
      </div>

      <div className="mt-4">
        <label htmlFor="private-key-input" className="block text-sm font-medium text-gray-700 mb-1">
          Private key
        </label>
        <textarea
          id="private-key-input"
          rows={10}
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
          placeholder="Enter your private key"
        />
      </div>

      <div className="mt-8">
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

export default ImportPrivateKey
