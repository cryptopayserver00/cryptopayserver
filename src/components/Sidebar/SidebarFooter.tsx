import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {
  Sun,
  Moon,
  Monitor,
  LogOut,
  Settings,
  AlertTriangle,
  ArrowRightLeft,
  FlaskConical,
  Globe2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { useUserPresistStore } from '@/lib/store/user'
import { useStorePresistStore } from '@/lib/store/store'
import { useWalletPresistStore } from '@/lib/store/wallet'
import { useSnackPresistStore } from '@/lib/store/snack'
import { LANGUAGES } from '@/packages/constants'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useShallow } from 'zustand/react/shallow'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'

type NetworkValue = 'mainnet' | 'testnet'

interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  collapsed?: boolean
}

function networkLabel(value: NetworkValue) {
  return value === 'mainnet' ? 'Mainnet' : 'Testnet'
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
  collapsed,
  className,
  ...rest
}) => {
  const router = useRouter()
  const { i18n } = useTranslation('')
  const [language, setLanguage] = useState<string>('')
  const [open, setOpen] = useState(false)
  const [profileUrl, setProfileUrl] = useState('')
  const [pendingNetwork, setPendingNetwork] = useState<NetworkValue | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const {
    userId,
    username,
    userEmail,
    userTheme,
    setUserTheme,
    userHideSensitiveInfo,
    setUserHideSensitiveInfo,
    network,
    setNetwork,
    setShowProgress,
    resetUser,
    lang,
    setLang,
  } = useUserPresistStore(
    useShallow((state) => ({
      userId: state.userId,
      username: state.username,
      userEmail: state.userEmail,
      userTheme: state.userTheme,
      setUserTheme: state.setUserTheme,
      userHideSensitiveInfo: state.userHideSensitiveInfo,
      setUserHideSensitiveInfo: state.setUserHideSensitiveInfo,
      network: state.network,
      setNetwork: state.setNetwork,
      setShowProgress: state.setShowProgress,
      resetUser: state.resetUser,
      lang: state.lang,
      setLang: state.setLang,
    }))
  )

  const { resetStore } = useStorePresistStore(
    useShallow((state) => ({
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

  const handleChangeUserHideSensitiveInfo = (checked: boolean) => {
    setUserHideSensitiveInfo(checked)
  }

  const handleChangeNetwork = (value: string) => {
    if (value !== 'mainnet' && value !== 'testnet') return
    if (value === network) return
    setPendingNetwork(value)
    setConfirmOpen(true)
  }

  const applyNetworkSwitch = async () => {
    if (!pendingNetwork || pendingNetwork === network) {
      setConfirmOpen(false)
      setPendingNetwork(null)
      return
    }

    const next = pendingNetwork
    setConfirmOpen(false)
    setOpen(false)
    setPendingNetwork(null)
    setShowProgress(true)

    try {
      setNetwork(next)
      setSnackSeverity(next === 'testnet' ? 'warning' : 'success')
      setSnackMessage(
        next === 'testnet'
          ? 'Switched to Testnet — coins have no real value'
          : 'Switched to Mainnet'
      )
      setSnackOpen(true)

      // Let the transition overlay paint, then remount route data for the new network.
      await new Promise((resolve) => window.setTimeout(resolve, 450))
      await router.replace(router.asPath, undefined, { scroll: false })
      await new Promise((resolve) => window.setTimeout(resolve, 350))
    } finally {
      setShowProgress(false)
    }
  }

  const onChangeLanguage = async (langName: string) => {
    setLanguage(langName)
    const code = LANGUAGES.find((item) => item.name === langName)?.code
    setLang(code || 'en')
    i18n.changeLanguage(code || 'en')
  }

  const onLogout = async () => {
    try {
      await axios.post(Http.logout)
    } catch {
      // still clear local state even if logout API fails
    }
    resetUser()
    resetStore()
    resetWallet()
    window.location.href = '/login'
  }

  useEffect(() => {
    if (lang != '') {
      setLanguage(LANGUAGES.find((item) => item.code === lang)?.name || 'English')
    }
  }, [lang])

  useEffect(() => {
    if (!userId) {
      setProfileUrl('')
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const response: any = await axios.get(Http.find_user_by_userid, {
          params: { user_id: userId },
        })
        if (cancelled) return
        if (response?.result) {
          setProfileUrl(response.data.profilePictureUrl || '')
        }
      } catch {
        if (!cancelled) setProfileUrl('')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [userId, open])

  const initial = (username || userEmail || 'U').charAt(0).toUpperCase()
  const switchingToTestnet = pendingNetwork === 'testnet'

  const accountAvatar = (
    <Avatar
      size={collapsed ? 'lg' : 'default'}
      className="bg-gradient-to-br from-blue-600 to-cyan-400 text-white after:border-white/20"
    >
      <AvatarImage src={profileUrl || undefined} alt={username || 'Account'} />
      <AvatarFallback className="bg-transparent font-semibold text-white">
        {initial}
      </AvatarFallback>
    </Avatar>
  )

  return (
    <div
      className={cn(
        'flex w-full flex-col items-center justify-center',
        collapsed ? 'px-2 py-3' : 'px-4 py-4',
        className
      )}
      {...rest}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {collapsed ? (
            <button
              type="button"
              aria-label="Open account menu"
              className="rounded-full outline-none ring-offset-background transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {accountAvatar}
            </button>
          ) : (
            <Button variant="ghost" className="w-full justify-start gap-2 px-2">
              {accountAvatar}
              <span className="truncate">{username || 'Account'}</span>
            </Button>
          )}
        </PopoverTrigger>

        <PopoverContent side="right" align="end" sideOffset={12} className="w-[300px] p-0">
          <div className="flex items-center gap-3 border-b px-4 py-3">
            <Avatar size="lg" className="bg-gradient-to-br from-blue-600 to-cyan-400 text-white">
              <AvatarImage src={profileUrl || undefined} alt={username || 'Account'} />
              <AvatarFallback className="bg-transparent text-sm font-semibold text-white">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{username || 'Account'}</p>
              {userEmail ? (
                <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
              ) : null}
            </div>
          </div>

          <div className="max-h-[70vh] space-y-5 overflow-y-auto px-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Theme
              </Label>
              <div className="flex items-center gap-1">
                <Button
                  variant={userTheme === 'auto' ? 'default' : 'outline'}
                  size="icon"
                  className="h-9 w-9"
                  aria-label="Auto theme"
                  onClick={() => setUserTheme('auto')}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={userTheme === 'light' ? 'default' : 'outline'}
                  size="icon"
                  className="h-9 w-9"
                  aria-label="Light theme"
                  onClick={() => setUserTheme('light')}
                >
                  <Sun className="h-4 w-4" />
                </Button>
                <Button
                  variant={userTheme === 'dark' ? 'default' : 'outline'}
                  size="icon"
                  className="h-9 w-9"
                  aria-label="Dark theme"
                  onClick={() => setUserTheme('dark')}
                >
                  <Moon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Label htmlFor="hide-sensitive" className="text-sm">
                Hide Sensitive Info
              </Label>
              <Switch
                id="hide-sensitive"
                checked={userHideSensitiveInfo}
                onCheckedChange={handleChangeUserHideSensitiveInfo}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-sm">Network</Label>
                <Badge
                  variant="outline"
                  className={cn(
                    'font-medium',
                    network === 'testnet'
                      ? 'border-amber-200 bg-amber-50 text-amber-800'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  )}
                >
                  {networkLabel(network)}
                </Badge>
              </div>
              <Select value={network} onValueChange={handleChangeNetwork}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mainnet">
                    <span className="inline-flex items-center gap-2">
                      <Globe2 className="h-3.5 w-3.5" />
                      Mainnet
                    </span>
                  </SelectItem>
                  <SelectItem value="testnet">
                    <span className="inline-flex items-center gap-2">
                      <FlaskConical className="h-3.5 w-3.5" />
                      Testnet
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Switching refreshes balances, invoices, and wallet data for that network.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Language</Label>
              <Select value={language} onValueChange={onChangeLanguage}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES?.map((item) => (
                    <SelectItem key={item.code} value={item.name}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="p-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => {
                setOpen(false)
                window.location.href = '/account'
              }}
            >
              <Settings className="h-4 w-4" />
              Manage Account
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(next) => {
          setConfirmOpen(next)
          if (!next) setPendingNetwork(null)
        }}
      >
        <AlertDialogContent size="default">
          <AlertDialogHeader>
            <AlertDialogMedia
              className={cn(
                switchingToTestnet
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              )}
            >
              {switchingToTestnet ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <ArrowRightLeft className="h-5 w-5" />
              )}
            </AlertDialogMedia>
            <AlertDialogTitle>
              Switch to {pendingNetwork ? networkLabel(pendingNetwork) : 'network'}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {switchingToTestnet ? (
                <>
                  You are leaving <strong>Mainnet</strong> for <strong>Testnet</strong>. Test
                  coins have no real value. Invoices, wallets, and balances will reload for the
                  test network.
                </>
              ) : (
                <>
                  You are leaving <strong>Testnet</strong> for <strong>Mainnet</strong>. Live
                  funds and production payment data will be shown after the page refreshes.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant={switchingToTestnet ? 'destructive' : 'default'}
              onClick={(e) => {
                e.preventDefault()
                void applyNetworkSwitch()
              }}
            >
              Switch to {pendingNetwork ? networkLabel(pendingNetwork) : 'network'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
