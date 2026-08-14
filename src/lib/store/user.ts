import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type UserPerisistState = {
  userId: number
  userEmail: string
  username: string
  isLogin: boolean
  userTheme: 'auto' | 'light' | 'dark'
  userHideSensitiveInfo: boolean
  showProgress: boolean
  sidebarCollapsed: boolean
  network: 'mainnet' | 'testnet'
  lang: string
}

type UserPerisistAction = {
  setUserId: (userId: number) => void
  getUserId: () => number
  setUserEmail: (userEmail: string) => void
  getUserEmail: () => string
  setUsername: (username: string) => void
  getUsername: () => string
  setIsLogin: (isLogin: boolean) => void
  getIsLogin: () => boolean
  setUserTheme: (theme: 'auto' | 'light' | 'dark') => void
  getUserTheme: () => string
  setUserHideSensitiveInfo: (userHideSensitiveInfo: boolean) => void
  getUserHideSensitiveInfo: () => boolean
  setNetwork: (network: 'mainnet' | 'testnet') => void
  getNetwork: () => string
  setShowProgress: (showProgress: boolean) => void
  getShowProgress: () => boolean
  setSidebarCollapsed: (sidebarCollapsed: boolean) => void
  getSidebarCollapsed: () => boolean
  setLang: (lang: string) => void
  getLang: () => string

  resetUser: () => void
}

const initialUserState: UserPerisistState = {
  userId: 0,
  userEmail: '',
  username: '',
  isLogin: false,
  userTheme: 'auto',
  userHideSensitiveInfo: false,
  showProgress: false,
  sidebarCollapsed: false,
  network: 'mainnet',
  lang: '',
}

export const useUserPresistStore = create(
  persist<UserPerisistState & UserPerisistAction>(
    (set, get) => ({
      ...initialUserState,

      setUserId: (value) => set(() => ({ userId: value })),
      getUserId: () => get().userId,
      setUserEmail: (value) => set(() => ({ userEmail: value })),
      getUserEmail: () => get().userEmail,
      setUsername: (value) => set(() => ({ username: value })),
      getUsername: () => get().username,
      setIsLogin: (value) => set(() => ({ isLogin: value })),
      getIsLogin: () => get().isLogin,
      setUserTheme: (value) => set(() => ({ userTheme: value })),
      getUserTheme: () => get().userTheme,
      setUserHideSensitiveInfo: (value) => set(() => ({ userHideSensitiveInfo: value })),
      getUserHideSensitiveInfo: () => get().userHideSensitiveInfo,
      setNetwork: (value) => set(() => ({ network: value })),
      getNetwork: () => get().network,
      setShowProgress: (value) => set(() => ({ showProgress: value })),
      getShowProgress: () => get().showProgress,
      setSidebarCollapsed: (value) => set(() => ({ sidebarCollapsed: value })),
      getSidebarCollapsed: () => get().sidebarCollapsed,
      setLang: (value) => set(() => ({ lang: value })),
      getLang: () => get().lang,

      resetUser: () => {
        set(initialUserState)
      },
    }),
    {
      name: 'cryptopayserver.store.user',
    }
  )
)
