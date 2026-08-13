import { useEffect, useState } from 'react'
import { User, Sun, Moon, Monitor, LogOut, Settings } from 'lucide-react'
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
import { useUserPresistStore } from '@/lib/store/user'
import { useStorePresistStore } from '@/lib/store/store'
import { useWalletPresistStore } from '@/lib/store/wallet'
import { LANGUAGES } from '@/packages/constants'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useShallow } from 'zustand/react/shallow'

interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  collapsed?: boolean
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
  children,
  collapsed,
  className,
  ...rest
}) => {
  const { t, i18n } = useTranslation('')
  const [language, setLanguage] = useState<string>('')
  const [open, setOpen] = useState(false)

  const {
    username,
    userTheme,
    setUserTheme,
    userHideSensitiveInfo,
    setUserHideSensitiveInfo,
    network,
    setNetwork,
    resetUser,
    lang,
    setLang,
  } = useUserPresistStore(
    useShallow((state) => ({
      username: state.username,
      userTheme: state.userTheme,
      setUserTheme: state.setUserTheme,
      userHideSensitiveInfo: state.userHideSensitiveInfo,
      setUserHideSensitiveInfo: state.setUserHideSensitiveInfo,
      network: state.network,
      setNetwork: state.setNetwork,
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

  const handleChangeUserHideSensitiveInfo = (checked: boolean) => {
    setUserHideSensitiveInfo(checked)
  }

  const handleChangeNetwork = (value: 'mainnet' | 'testnet') => {
    setNetwork(value)
  }

  const onChangeLanguage = async (lang: string) => {
    setLanguage(lang)
    const code = LANGUAGES.find((item) => item.name === lang)?.code
    setLang(code || 'en')
    i18n.changeLanguage(code || 'en')
  }

  useEffect(() => {
    if (lang != '') {
      setLanguage(LANGUAGES.find((item) => item.code === lang)?.name || 'English')
    }
  }, [lang])

  if (collapsed) {
    return (
      <div className="flex items-center justify-center py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 text-white" />
      </div>
    )
  }

  return (
    <div
      className={cn('flex w-full flex-col items-center justify-center px-4 py-4', className)}
      {...rest}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <User className="h-4 w-4" />
            <span className="truncate">{username || 'Account'}</span>
          </Button>
        </PopoverTrigger>

        <PopoverContent side="right" align="end" sideOffset={12} className="w-[300px] p-0">
          <div className="border-b px-4 py-3">
            <p className="truncate text-sm font-semibold">{username}</p>
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
                  onClick={() => setUserTheme('auto')}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={userTheme === 'light' ? 'default' : 'outline'}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setUserTheme('light')}
                >
                  <Sun className="h-4 w-4" />
                </Button>
                <Button
                  variant={userTheme === 'dark' ? 'default' : 'outline'}
                  size="icon"
                  className="h-9 w-9"
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
              <Label className="text-sm">Network</Label>
              <Select value={network} onValueChange={handleChangeNetwork}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mainnet">mainnet</SelectItem>
                  <SelectItem value="testnet">testnet</SelectItem>
                </SelectContent>
              </Select>
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
                window.location.href = '/account'
              }}
            >
              <Settings className="h-4 w-4" />
              Manage Account
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => {
                resetUser()
                resetStore()
                resetWallet()
                setTimeout(() => {
                  window.location.href = '/login'
                }, 1000)
              }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
