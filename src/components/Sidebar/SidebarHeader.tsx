import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Bell, ChevronDown, Plus, Store } from 'lucide-react'
import { useStorePresistStore } from '@/lib/store/store'
import axios from '@/utils/http/axios'
import { getApiErrorMessage } from '@/utils/http/api-error'
import { Http } from '@/utils/http/http'
import { useUserPresistStore } from '@/lib/store/user'
import { useSnackPresistStore } from '@/lib/store/snack'
import { useWalletPresistStore } from '@/lib/store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { SiteLogo } from '../Logo/SiteLogo'
import { useShallow } from 'zustand/react/shallow'
import { StoreType } from '@/utils/types'
import { syncWalletForStore } from '@/utils/sync-wallet-for-store'
import { pickPreferredStore, rememberLastStore } from '@/utils/last-store'

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  collapsed?: boolean
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  className = '',
  collapsed = false,
  ...rest
}) => {
  const router = useRouter()

  const [stores, setStores] = useState<StoreType[]>([])
  const [notificationCount, setNotificationCount] = useState<number>(0)

  const { userId, network } = useUserPresistStore(
    useShallow((state) => ({
      userId: state.userId,
      network: state.network,
    }))
  )

  const {
    storeId,
    setStoreId,
    setStoreName,
    setStoreCurrency,
    setStorePriceSource,
    setIsStore,
    resetStore,
  } = useStorePresistStore(
    useShallow((state) => ({
      storeId: state.storeId,
      setStoreId: state.setStoreId,
      setStoreName: state.setStoreName,
      setStoreCurrency: state.setStoreCurrency,
      setStorePriceSource: state.setStorePriceSource,
      setIsStore: state.setIsStore,
      resetStore: state.resetStore,
    }))
  )

  const { resetWallet } = useWalletPresistStore(
    useShallow((state) => ({
      resetWallet: state.resetWallet,
    }))
  )

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      setSnackSeverity: state.setSnackSeverity,
      setSnackMessage: state.setSnackMessage,
      setSnackOpen: state.setSnackOpen,
    }))
  )

  const currentStore = stores.find((s) => s.id === storeId)

  const getStore = async (currentUserId: number) => {
    try {
      if (currentUserId === 0) return

      const response: any = await axios.get(Http.find_store, {
        params: { user_id: currentUserId },
      })

      if (response?.result) {
        const list: StoreType[] = (response.data ?? []).map((item: any) => ({
          id: item.id,
          name: item.name,
          currency: item.currency,
          priceSource: item.priceSource,
        }))
        setStores(list)

        if (list.length === 0) {
          setNotificationCount(0)
          resetStore()
          resetWallet()
          return
        }

        // Prefer current storeId, then last-used store for this user, then first in list.
        const selected =
          list.find((item) => item.id === storeId) ||
          pickPreferredStore(currentUserId, list) ||
          list[0]
        if (!selected) return
        if (selected.id !== storeId) {
          setStoreId(selected.id)
          setStoreName(selected.name)
          setStoreCurrency(selected.currency)
          setStorePriceSource(selected.priceSource)
        }
        setIsStore(true)
        rememberLastStore(currentUserId, selected.id)
        // Always re-sync wallet from server: logout clears local wallet flags, and a matching
        // storeId alone used to skip this path so newly created wallets looked "gone".
        await syncWalletForStore(selected.id)
      } else {
        setSnackSeverity('error')
        setSnackMessage('Could not load data.')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage(getApiErrorMessage(e))
      setSnackOpen(true)
      console.error(e)
    }
  }

  const getNotification = async (currentStoreId: number, currentNetwork: string) => {
    try {
      if (!currentStoreId) {
        setNotificationCount(0)
        return
      }

      const response: any = await axios.get(Http.find_notification, {
        params: {
          store_id: currentStoreId,
          network: currentNetwork === 'mainnet' ? 1 : 2,
          is_seen: 2,
        },
      })

      if (response?.result) {
        setNotificationCount(response.data?.length || 0)
      } else {
        setSnackSeverity('error')
        setSnackMessage('Could not load data.')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage(getApiErrorMessage(e))
      setSnackOpen(true)
      console.error(e)
    }
  }

  const onClickStore = async (id: number) => {
    try {
      const response: any = await axios.get(Http.find_store_by_id, {
        params: { id },
      })

      if (response?.result) {
        setStoreId(response.data.id)
        setStoreName(response.data.name)
        setStoreCurrency(response.data.currency)
        setStorePriceSource(response.data.priceSource)
        setIsStore(true)
        rememberLastStore(userId, response.data.id)

        await syncWalletForStore(response.data.id)

        router.replace(router.asPath)
      } else {
        setSnackSeverity('error')
        setSnackMessage('Cannot find the store, please try again later.')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage(getApiErrorMessage(e))
      setSnackOpen(true)
      console.error(e)
    }
  }

  useEffect(() => {
    getStore(userId)
  }, [userId])

  useEffect(() => {
    getNotification(storeId, network)
  }, [storeId, network])

  return (
    <div className={`px-4 w-full ${className}`} {...rest}>
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <SiteLogo href="/dashboard" collapsed={collapsed} />

        {!collapsed && stores.length > 0 && (
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition-colors relative flex items-center justify-center text-gray-600 focus:outline-none"
            onClick={() => router.push('/notifications')}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {notificationCount}
              </span>
            )}
          </button>
        )}
      </div>

      {stores.length > 0 && !collapsed && (
        <div className="mt-5">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors focus:outline-none">
              <div className="flex items-center gap-2 truncate">
                <Store size={16} className="text-gray-500 shrink-0" />
                <span className="truncate">{currentStore?.name || 'Select Store'}</span>
              </div>
              <ChevronDown size={14} className="text-gray-400 shrink-0 ml-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[218px]" align="start">
              {stores.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => onClickStore(item.id)}
                  className={`cursor-pointer text-xs font-medium ${
                    item.id === storeId ? 'text-[#0098e5] bg-blue-50 font-semibold' : ''
                  }`}
                >
                  {item.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push('/stores/create')}
                className="cursor-pointer text-xs text-[#0098e5] font-medium flex items-center gap-2"
              >
                <Plus size={14} />
                <span>Create Store</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}
