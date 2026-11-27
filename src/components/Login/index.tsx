import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

import { AuthShell } from '@/components/Auth/AuthShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useSnackPresistStore,
  useStorePresistStore,
  useUserPresistStore,
  useWalletPresistStore,
} from '@/lib/store'
import { useRedirectIfAuthenticated } from '@/hooks/useRedirectIfAuthenticated'
import axios from '@/utils/http/axios'
import { getApiErrorMessage } from '@/utils/http/api-error'
import { Http } from '@/utils/http/http'
import { IsValidEmail, isValidPassword } from '@/utils/verify'
import { syncWalletForStore } from '@/utils/sync-wallet-for-store'
import { pickPreferredStore, rememberLastStore } from '@/utils/last-store'
import { useShallow } from 'zustand/react/shallow'

const Login = () => {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [totpCode, setTotpCode] = useState<string>('')
  const [requires2fa, setRequires2fa] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useRedirectIfAuthenticated()

  const { setUserId, setUserEmail, setUsername, setIsLogin } = useUserPresistStore(
    useShallow((state) => ({
      setUserId: state.setUserId,
      setUserEmail: state.setUserEmail,
      setUsername: state.setUsername,
      setIsLogin: state.setIsLogin,
    }))
  )

  const { setStoreId, setStoreName, setStoreCurrency, setStorePriceSource, setIsStore, resetStore } =
    useStorePresistStore(
      useShallow((state) => ({
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

  const showSnack = (severity: 'success' | 'error', message: string) => {
    setSnackSeverity(severity)
    setSnackMessage(message)
    setSnackOpen(true)
  }

  const finishLogin = async (user: { id: number; email: string; username: string }) => {
    setUserId(user.id)
    setUserEmail(user.email)
    setUsername(user.username)
    setIsLogin(true)

    const store_resp: any = await axios.get(Http.find_store, {
      params: {
        user_id: user.id,
      },
    })

    if (store_resp.result) {
      if (store_resp.data.length > 0) {
        const preferred = pickPreferredStore(user.id, store_resp.data as { id: number }[])
        const store = preferred || store_resp.data[0]
        setStoreId(store.id)
        setStoreName(store.name)
        setStoreCurrency(store.currency)
        setStorePriceSource(store.priceSource)
        setIsStore(true)
        rememberLastStore(user.id, store.id)

        await syncWalletForStore(store.id)

        window.location.href = '/dashboard'
      } else {
        resetStore()
        resetWallet()
        window.location.href = '/stores/create'
      }
    } else {
      showSnack('error', 'Could not find the store.')
    }
  }

  const onLogin = async () => {
    if (!email || email === '' || !IsValidEmail(email)) {
      showSnack('error', 'Please enter a valid email')
      return
    }

    if (!password || !isValidPassword(password)) {
      showSnack('error', 'Please enter a valid password')
      return
    }

    try {
      setLoading(true)

      const response: any = await axios.post(Http.login, {
        email: email,
        password: password,
      })

      if (response.data?.requires2fa) {
        setRequires2fa(true)
        showSnack('success', 'Enter your authenticator code')
        return
      }

      if (response.result) {
        await finishLogin(response.data)
      } else {
        showSnack('error', 'Incorrect username or password!')
      }
    } catch (e) {
      showSnack('error', getApiErrorMessage(e))
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const onVerify2fa = async () => {
    if (!totpCode || totpCode.length < 6) {
      showSnack('error', 'Enter a valid authenticator code')
      return
    }

    try {
      setLoading(true)
      const response: any = await axios.post(Http.verify_2fa, {
        code: totpCode,
      })

      if (response.result) {
        await finishLogin(response.data)
      } else {
        showSnack('error', response.message || 'Invalid authenticator code')
      }
    } catch (e) {
      showSnack('error', getApiErrorMessage(e))
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title={requires2fa ? 'Two-factor check' : 'Sign in'}
      subtitle={
        requires2fa
          ? 'Enter the 6-digit code from your authenticator app to finish signing in.'
          : 'Open your merchant dashboard — invoices, wallets, and payouts stay on your infrastructure.'
      }
    >
      {!requires2fa ? (
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-11 border-slate-200 bg-white"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-sm text-slate-500 transition-colors hover:text-teal-800"
              >
                Forgot password?
              </Link>
            </div>

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onLogin()
                }}
                className="h-11 border-slate-200 bg-white pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-700"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            className="h-11 w-full bg-teal-800 text-white hover:bg-teal-700"
            size="lg"
            onClick={onLogin}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign in
          </Button>

          {process.env.NEXT_PUBLIC_DISABLE_PUBLIC_REGISTRATION !== 'true' && (
            <p className="text-center text-sm text-slate-500">
              New here?{' '}
              <Link href="/register" className="font-medium text-teal-800 hover:text-teal-700">
                Create an account
              </Link>
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="totp">Authenticator code</Label>
            <Input
              id="totp"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onVerify2fa()
              }}
              placeholder="123456"
              className="h-11 border-slate-200 bg-white text-center font-mono text-lg tracking-[0.35em]"
            />
          </div>

          <Button
            className="h-11 w-full bg-teal-800 text-white hover:bg-teal-700"
            size="lg"
            onClick={onVerify2fa}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify & continue
          </Button>

          <Button
            className="h-11 w-full"
            size="lg"
            variant="ghost"
            onClick={() => {
              setRequires2fa(false)
              setTotpCode('')
            }}
          >
            Back to sign in
          </Button>
        </div>
      )}
    </AuthShell>
  )
}

export default Login
