import MetaTags from '@/components/Common/MetaTags'
import HomeSidebar from '@/components/Sidebar'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useSnackPresistStore, useUserPresistStore } from '@/lib/store'
import { routes } from './Routes'
import { useTranslation } from 'react-i18next'
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  X,
  Loader2,
  FlaskConical,
  AlertTriangle,
} from 'lucide-react'
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
  const { i18n } = useTranslation('')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const {
    isLogin,
    lang,
    setLang,
    sidebarCollapsed,
    setSidebarCollapsed,
    network,
    showProgress,
  } = useUserPresistStore(
    useShallow((state) => ({
      isLogin: state.isLogin,
      lang: state.lang,
      setLang: state.setLang,
      sidebarCollapsed: state.sidebarCollapsed,
      setSidebarCollapsed: state.setSidebarCollapsed,
      network: state.network,
      showProgress: state.showProgress,
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
  }, [router.pathname, lang, isLogin, setLang, i18n])

  const handleSidebarCollapsedChange = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed)
  }

  useEffect(() => {
    setSnackOpen(false)
  }, [setSnackOpen])

  useEffect(() => {
    if (!snackOpen) return
    const timer = setTimeout(() => setSnackOpen(false), 3000)
    return () => clearTimeout(timer)
  }, [snackOpen, setSnackOpen])

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
            mobileOpen={mobileNavOpen}
            onMobileOpenChange={setMobileNavOpen}
          />

          <div
            className={cn(
              'flex flex-col flex-1 min-w-0 min-h-screen transition-all duration-200',
              // Desktop only: offset for fixed sidebar. Mobile uses full width + drawer.
              sidebarCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[250px]'
            )}
          >
            {currentRoute?.enableHomeHeader && (
              <HomeHeader showMenuButton onMenuClick={() => setMobileNavOpen(true)} />
            )}

            {isLogin && network === 'testnet' ? (
              <div className="border-b border-amber-200 bg-amber-50 px-3 py-2 text-amber-900 sm:px-4 lg:px-6">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <FlaskConical className="h-4 w-4 shrink-0" />
                  <span className="font-medium">Testnet mode</span>
                  <span className="text-amber-800/80">
                    Coins here have no real value.
                  </span>
                  <Link
                    href="/freecoin"
                    className="font-medium underline underline-offset-2 hover:text-amber-950"
                  >
                    Get free coins
                  </Link>
                </div>
              </div>
            ) : null}

            <main
              key={network}
              className={cn(
                'flex-1 w-full min-w-0 px-3 py-4 sm:px-4 sm:py-5 lg:p-6 transition-opacity duration-300',
                showProgress ? 'opacity-40 pointer-events-none' : 'opacity-100'
              )}
            >
              {currentRoute?.component || null}
            </main>
            {currentRoute?.enableHomeFooter && <HomeFooter />}
          </div>
        </div>
      ) : (
        <div className="flex flex-col min-h-screen">
          <main key={network} className="flex-1 w-full min-w-0">
            {currentRoute?.component || null}
          </main>
          {currentRoute?.enableHomeFooter && <HomeFooter />}
        </div>
      )}

      {showProgress ? (
        <div className="fixed inset-0 z-[998] flex items-center justify-center bg-background/70 backdrop-blur-[2px]">
          <div className="mx-4 flex max-w-sm flex-col items-center gap-3 rounded-2xl border bg-white px-6 py-7 text-center shadow-xl">
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full',
                network === 'testnet' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              )}
            >
              {network === 'testnet' ? (
                <AlertTriangle className="h-6 w-6" />
              ) : (
                <Loader2 className="h-6 w-6 animate-spin" />
              )}
            </div>
            <div>
              <p className="text-base font-semibold">
                Switching to {network === 'testnet' ? 'Testnet' : 'Mainnet'}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Reloading wallets, invoices, and balances for this network…
              </p>
            </div>
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          'fixed top-4 right-3 sm:top-6 sm:right-6 z-[999] max-w-[calc(100vw-1.5rem)] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg bg-white border transition-all duration-300',
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
