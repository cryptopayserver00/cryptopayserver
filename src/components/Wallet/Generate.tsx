import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStorePresistStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'

const CreateWallet = () => {
  const router = useRouter()

  const { isStore } = useStorePresistStore(
    useShallow((state) => ({
      isStore: state.isStore,
    }))
  )

  const onClickImport = () => {
    router.push('/wallet/import')
  }

  const onClickGenerate = () => {
    router.push('/wallet/generate')
  }

  useEffect(() => {
    if (!isStore) {
      router.push('/stores/create')
    }
  }, [isStore])

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto flex flex-col items-center pt-10">
        <h1 className="text-3xl font-bold text-gray-900">Let&apos;s get started</h1>

        <div className="w-full max-w-2xl mt-12 space-y-3">
          <h2 className="text-xl font-semibold text-gray-800">I don&apos;t have a wallet</h2>
          <button
            onClick={onClickGenerate}
            className="w-full text-left bg-white rounded-xl border border-gray-200 p-6 shadow-sm transition-all duration-200 hover:border-indigo-500 hover:shadow-md group focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-5">
                <svg
                  className="w-8 h-8 text-indigo-600 group-hover:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-xl font-medium text-gray-900">Create a new wallet</span>
              </div>
              <svg
                className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        </div>

        <div className="w-full max-w-2xl mt-8 space-y-3">
          <h2 className="text-xl font-semibold text-gray-800">I have a wallet</h2>
          <button
            onClick={onClickImport}
            className="w-full text-left bg-white rounded-xl border border-gray-200 p-6 shadow-sm transition-all duration-200 hover:border-indigo-500 hover:shadow-md group focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-5">
                <svg
                  className="w-8 h-8 text-indigo-600 group-hover:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-xl font-medium text-gray-900">
                  Connect an existing wallet
                </span>
              </div>
              <svg
                className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateWallet
