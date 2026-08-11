import MetaTags from '@/components/Common/MetaTags'
import HomeSidebar from '@/components/Sidebar'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import {
  useWalletPresistStore,
  useSnackPresistStore,
  useUserPresistStore,
  useStorePresistStore,
} from '@/lib/store'
import { routes } from './Routes'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react'
import HomeHeader from '../Home/HomeHeader'
import HomeFooter from '../Home/HomeFooter'
import { RouteType } from '@/utils/types'
import { cn } from '@/lib/utils'

const snackIcons = {
  success: { icon: CheckCircle2, className: 'text-green-500' },
  error: { icon: XCircle, className: 'text-red-500' },
  warning: { icon: AlertCircle, className: 'text-yellow-500' },
  info: { icon: Info, className: 'text-blue-500' },
}

const Index = () => {
  const router = useRouter()
  const { t, i18n } = useTranslation('')
  const { snackOpen, snackMessage, snackSeverity, setSnackOpen } = useSnackPresistStore(
    (state) => state
  )

  // const { getIsLogin, getNetwork, setShowSidebar, getShowSidebar, getShowProgress } =
  //   useUserPresistStore((state) => state)
  // const { getIsWallet } = useWalletPresistStore((state) => state)
  // const { getIsStore } = useStorePresistStore((state) => state)
  // const { getLang, setLang } = useUserPresistStore((state) => state)

  // const [isLogin, setLogin] = useState<boolean>(false)
  // const [isStore, setStore] = useState<boolean>(false)
  // const [isWallet, setWallet] = useState<boolean>(false)
  // const [network, setNetwork] = useState<string>()

  const { sidebarCollapsed, setSidebarCollapsed } = useUserPresistStore((state) => state)
  const [currentRoute, setCurrentRoute] = useState<RouteType>()

  // useEffect(() => {
  //   if (!getLang() || getLang() === '') {
  //     setLang('en')
  //     i18n.changeLanguage('en')
  //   }

  //   const route = routes.find((item) => item.path === router.pathname)

  //   if (!route) return

  //   const loginStatus = getIsLogin()
  //   const storeStatus = getIsStore()
  //   const walletStatus = getIsWallet()
  //   const network = getNetwork()

  //   setLogin(loginStatus)
  //   setStore(storeStatus)
  //   setWallet(walletStatus)
  //   setNetwork(network)

  //   if (route?.needLogin && !loginStatus) {
  //     window.location.href = '/login'
  //   }

  //   setCurrentRoute(route)
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [router.pathname, getIsLogin, getIsStore, getIsWallet, getLang])

  const handleSidebarCollapsedChange = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed)
  }

  useEffect(() => {
    const route = routes.find((item) => item.path === router.pathname)
    if (!route) return
    if (route?.needLogin) {
      window.location.href = '/login'
      return
    }
    setCurrentRoute(route)
  }, [router.pathname])

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

  // return (
  //   <Box height={'100%'}>
  //     <MetaTags title={currentRoute?.title} />

  //     {currentRoute?.enableSidebar ? (
  //       <Stack direction={'row'} height={'100%'}>
  //         {getShowSidebar() ? <HomeSidebar /> : null}

  //         <Box width={'100%'}>
  //           {getShowProgress() ? <LinearProgress /> : null}

  //           <Box m={2}>
  //             <IconButton
  //               onClick={() => {
  //                 setShowSidebar(!getShowSidebar())
  //               }}
  //             >
  //               <ControlCameraIcon />
  //             </IconButton>
  //           </Box>

  //           <Box>
  //             {!isStore && (
  //               <Box mb={1}>
  //                 <Alert severity="warning">
  //                   <AlertTitle>Warning</AlertTitle>
  //                   <Typography>
  //                     You don&apos;t have a store yet. Please click&nbsp;
  //                     <Link href={'/stores/create'}>here</Link>
  //                     &nbsp;to create a new one.
  //                   </Typography>
  //                 </Alert>
  //               </Box>
  //             )}

  //             {!isWallet && (
  //               <Box mb={1}>
  //                 <Alert severity="warning">
  //                   <AlertTitle>Warning</AlertTitle>
  //                   <Typography>
  //                     You don&apos;t have a wallet yet. Please click&nbsp;
  //                     <Link href={'/wallet/create'}>here</Link>
  //                     &nbsp;to create a new one.
  //                   </Typography>
  //                 </Alert>
  //               </Box>
  //             )}

  //             {isWallet && network === 'testnet' && (
  //               <Box mb={1}>
  //                 <Alert severity="warning">
  //                   <AlertTitle>Warning</AlertTitle>
  //                   <Typography>
  //                     This is a test network, and the currency has no real value. If you need free
  //                     coins, you can get them&nbsp;
  //                     <Link href={'/freecoin'} target="_blank">
  //                       here.
  //                     </Link>
  //                   </Typography>
  //                 </Alert>
  //               </Box>
  //             )}

  //             {isWallet && isStore && (currentRoute.component || null)}

  //             {isWallet && isStore && currentRoute?.enableInnerFooter && (
  //               <Box>
  //                 <Footer />
  //               </Box>
  //             )}
  //           </Box>
  //         </Box>
  //       </Stack>
  //     ) : (
  //       <Box>
  //         {currentRoute?.component || null}

  //         {currentRoute?.enableInnerFooter && (
  //           <Box>
  //             <Footer />
  //           </Box>
  //         )}
  //       </Box>
  //     )}

  //     <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'right' }} open={snackOpen}>
  //       <Alert
  //         onClose={() => {
  //           setSnackOpen(false)
  //         }}
  //         severity={snackSeverity}
  //         variant="filled"
  //         sx={{ width: '100%' }}
  //       >
  //         {snackMessage}
  //       </Alert>
  //     </Snackbar>
  //   </Box>
  // )
}

export default Index
