import { useState } from 'react'
import { useWalletPresistStore } from '@/lib/store'
import { useSnackPresistStore } from '@/lib/store/snack'
import { useStorePresistStore } from '@/lib/store/store'
import { useUserPresistStore } from '@/lib/store/user'
import { CURRENCY, PRICE_RESOURCE } from '@/packages/constants'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { SiteLogo } from '../Logo/SiteLogo'
import { useShallow } from 'zustand/react/shallow'

const CreateStore = () => {
  const [name, setName] = useState<string>('')
  const [currency, setCurrency] = useState<string>(CURRENCY[0])
  const [priceSource, setPriceSource] = useState<string>(PRICE_RESOURCE[0])

  const { userId } = useUserPresistStore(
    useShallow((state) => ({
      userId: state.userId,
    }))
  )

  const { resetWallet } = useWalletPresistStore(
    useShallow((state) => ({
      resetWallet: state.resetWallet,
    }))
  )

  const { setStoreId, setStoreName, setStoreCurrency, setStorePriceSource, setIsStore } =
    useStorePresistStore(
      useShallow((state) => ({
        setStoreId: state.setStoreId,
        setStoreName: state.setStoreName,
        setStoreCurrency: state.setStoreCurrency,
        setStorePriceSource: state.setStorePriceSource,
        setIsStore: state.setIsStore,
      }))
    )

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      setSnackSeverity: state.setSnackSeverity,
      setSnackMessage: state.setSnackMessage,
      setSnackOpen: state.setSnackOpen,
    }))
  )

  const onCreateStore = async () => {
    try {
      if (!name || name === '') {
        setSnackSeverity('error')
        setSnackMessage('Incorrect name input')
        setSnackOpen(true)
        return
      }

      if (!CURRENCY.includes(currency)) {
        setSnackSeverity('error')
        setSnackMessage('Incorrect currency select')
        setSnackOpen(true)
        return
      }

      if (!PRICE_RESOURCE.includes(priceSource)) {
        setSnackSeverity('error')
        setSnackMessage('Incorrect price source select')
        setSnackOpen(true)
        return
      }

      const response: any = await axios.post(Http.create_store, {
        user_id: userId,
        name: name,
        currency: currency,
        price_source: priceSource,
        website: window.location.origin,
      })

      if (response.result) {
        setStoreId(response.data.id)
        setStoreName(response.data.name)
        setStoreCurrency(response.data.currency)
        setStorePriceSource(response.data.price_source)
        setIsStore(true)

        resetWallet()

        setSnackSeverity('success')
        setSnackMessage('Successful creation!')
        setSnackOpen(true)

        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 2000)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-lg mx-auto flex flex-col items-center">
        <SiteLogo />

        <h1 className="text-2xl font-bold text-gray-900 mt-4">Create a new store</h1>
        <p className="text-base text-gray-600 mt-2 text-center">
          Create a store to begin accepting payments.
        </p>

        <div className="w-full mt-6 bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <div className="mt-1">
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Default currency</label>
              <div className="mt-1">
                <select
                  aria-label="Without label"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                >
                  {CURRENCY &&
                    CURRENCY.length > 0 &&
                    CURRENCY.map((item, index) => (
                      <option value={item} key={index}>
                        {item}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Preferred Price Source
              </label>
              <div className="mt-1">
                <select
                  aria-label="Without label"
                  value={priceSource}
                  onChange={(e) => setPriceSource(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                >
                  {PRICE_RESOURCE &&
                    PRICE_RESOURCE.length > 0 &&
                    PRICE_RESOURCE.map((item, index) => (
                      <option value={item} key={index}>
                        {item}
                      </option>
                    ))}
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                The recommended price source gets chosen based on the default currency.
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={onCreateStore}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Create Store
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateStore
