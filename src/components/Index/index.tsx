import MetaTags from '@/components/Common/MetaTags'
import HomeSidebar from '@/components/Sidebar'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useSnackPresistStore, useUserPresistStore } from '@/lib/store'
import { routes } from './Routes'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react'
import HomeHeader from '../Home/HomeHeader'
import HomeFooter from '../Home/HomeFooter'
import { RouteType } from '@/utils/types'
import { cn } from '@/lib/utils'
import { useShallow } from 'zustand/react/shallow'

const snackIcons = {
  success: { icon: CheckCircle2, className: 'text-green-500' },
  error: { icon: XCircle, className: 'text-red-500' },
  warning: { icon: AlertCircle, className: 'text-yellow-500' },
  info: { icon: Info, className: 'text-blue-500' },
}

const Index = () => {
  const router = useRouter()
  const { t, i18n } = useTranslation('')

  const { isLogin, lang, setLang, sidebarCollapsed, setSidebarCollapsed } = useUserPresistStore(
    useShallow((state) => ({
      isLogin: state.isLogin,
      lang: state.lang,
      setLang: state.setLang,
      sidebarCollapsed: state.sidebarCollapsed,
      setSidebarCollapsed: state.setSidebarCollapsed,
    }))
  )

  const { snackOpen, snackMessage, snackSeverity, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      snackOpen: state.snackOpen,
      snackMessage: state.snackMessage,
      snackSeverity: state.snackSeverity,
      setSnackOpen: state.setSnackOpen,
    }))
  )

  const [currentRoute, setCurrentRoute] = useState<RouteType>()

  useEffect(() => {
    if (lang === '') {
      setLang('en')
      i18n.changeLanguage('en')
    }

    const route = routes.find((item) => item.path === router.pathname)
    if (!route) return

    if (route?.needLogin && !isLogin) {
      window.location.href = '/login'
    }

    setCurrentRoute(route)
  }, [router.pathname, lang, isLogin])

  const handleSidebarCollapsedChange = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed)
  }

  useEffect(() => {
    setSnackOpen(false)
  }, [])

  useEffect(() => {
    if (!snackOpen) return
    const timer = setTimeout(() => setSnackOpen(false), 3000)
    return () => clearTimeout(timer)
  }, [snackOpen])

  const SnackIcon = snackSeverity ? snackIcons[snackSeverity]?.icon : Info
  const snackIconClass = snackSeverity ? snackIcons[snackSeverity]?.className : ''

  return (
    <div className="min-h-screen bg-gray-50">
      <MetaTags title={currentRoute?.title} />

      {currentRoute?.enableSidebar ? (
        <div className="flex min-h-screen">
          <HomeSidebar
            collapsed={sidebarCollapsed}
            onCollapsedChange={handleSidebarCollapsedChange}
          />

          <div
            className={cn(
              'flex flex-col flex-1 min-h-screen transition-all duration-200',
              sidebarCollapsed ? 'ml-[72px]' : 'ml-60'
            )}
          >
            {currentRoute?.enableHomeHeader && <HomeHeader />}
            <main className="flex-1 p-6">{currentRoute?.component || null}</main>
            {currentRoute?.enableHomeFooter && <HomeFooter />}
          </div>
        </div>
      ) : (
        <div className="flex flex-col min-h-screen">
          <main className="flex-1">{currentRoute?.component || null}</main>
          {currentRoute?.enableHomeFooter && <HomeFooter />}
        </div>
      )}

      <div
        className={cn(
          'fixed top-6 right-6 z-[999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg bg-white border transition-all duration-300',
          snackOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        )}
      >
        {SnackIcon && <SnackIcon className={cn('h-5 w-5 shrink-0', snackIconClass)} />}
        <p className="text-sm font-medium text-gray-700">{snackMessage}</p>
        <button
          onClick={() => setSnackOpen(false)}
          className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default Index
