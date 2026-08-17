import { useEffect } from 'react'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import {
  useSnackPresistStore,
  useStorePresistStore,
  useUserPresistStore,
  useWalletPresistStore,
} from '@/lib/store'
import Link from 'next/link'
import { Wallet, ChevronRight } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'

const GenerateWallet = () => {
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

  const { setWalletId, setIsWallet } = useWalletPresistStore(
    useShallow((state) => ({
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

  const onClickMnemonicPhrase = async () => {
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

      const create_wallet_resp: any = await axios.post(Http.create_wallet, {
        user_id: userId,
        store_id: storeId,
      })

      if (create_wallet_resp.result) {
        setWalletId(create_wallet_resp.data.walletId)
        setIsWallet(true)

        setSnackSeverity('success')
        setSnackMessage('Successful creation!')
        setSnackOpen(true)

        await walletToBlockScan(create_wallet_resp.data.walletId)

        setTimeout(() => {
          window.location.href = '/wallet/setPassword'
        }, 2000)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
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

  const onClickHardwareWallet = () => {
    setSnackMessage('Not supported.')
    setSnackSeverity('warning')
    setSnackOpen(true)
  }

  useEffect(() => {
    if (!isStore) {
      window.location.href = '/stores/create'
    }
  }, [isStore])

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mt-20 flex flex-col items-center">
          <h1 className="text-3xl font-bold tracking-tight">Create wallet</h1>

          <div className="mt-8 w-full max-w-[700px]">
            <button
              type="button"
              onClick={onClickMnemonicPhrase}
              className="w-full rounded-xl border bg-white p-6 text-left shadow-sm transition hover:bg-gray-50 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <Wallet className="h-8 w-8 text-gray-700" />
                  <span className="text-xl font-semibold">Mnemonic phrase</span>
                </div>
                <ChevronRight className="h-6 w-6 text-gray-400" />
              </div>
            </button>
          </div>

          <div className="mt-8 w-full max-w-[700px]">
            <button
              type="button"
              onClick={onClickHardwareWallet}
              className="w-full rounded-xl border bg-white p-6 text-left shadow-sm transition hover:bg-gray-50 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <Wallet className="h-8 w-8 text-gray-700" />
                  <span className="text-xl font-semibold">Hardware wallet</span>
                </div>
                <ChevronRight className="h-6 w-6 text-gray-400" />
              </div>
            </button>
          </div>

          <p className="mt-10 text-center text-sm text-gray-600">
            Continuing implies agreeing to CryptoPayServer{' '}
            <Link href="#" className="text-primary underline hover:opacity-80">
              user agreement
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

export default GenerateWallet
