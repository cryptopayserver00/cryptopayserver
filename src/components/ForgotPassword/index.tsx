import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSnackPresistStore, useUserPresistStore } from '@/lib/store'
import axios from '@/utils/http/axios'
import { getApiErrorMessage } from '@/utils/http/api-error'
import { Http } from '@/utils/http/http'
import { IsValidEmail, isValidPassword } from '@/utils/verify'
import { SiteLogo } from '../Logo/SiteLogo'
import { useShallow } from 'zustand/react/shallow'

const ForgotPassword = () => {
  const router = useRouter()
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [token, setToken] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const { isLogin } = useUserPresistStore(
    useShallow((state) => ({
      isLogin: state.isLogin,
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

  useEffect(() => {
    if (!router.isReady) return
    // Prefer fragment token (not logged / not in Referer); fall back to legacy query param.
    let fromHash = ''
    if (typeof window !== 'undefined' && window.location.hash) {
      const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
      fromHash = params.get('token') || ''
    }
    const q = router.query.token
    const fromQuery = typeof q === 'string' ? q : ''
    const next = fromHash || fromQuery
    if (next) {
      setToken(next)
      // Drop query token from the address bar after capture.
      if (fromQuery && !fromHash) {
        router.replace('/forgot-password', undefined, { shallow: true })
      }
    }
  }, [router.isReady, router.query.token, router])

  const onSendResetEmail = async () => {
    if (!email || !IsValidEmail(email)) {
      showSnack('error', 'Please enter a valid email')
      return
    }

    try {
      setLoading(true)
      const response: any = await axios.post(Http.send_reset_email, { email })

      if (response.result) {
        showSnack('success', 'If the account exists, a reset email has been sent')
      } else {
        showSnack('error', 'Unable to send reset email')
      }
    } catch (e) {
      showSnack('error', getApiErrorMessage(e))
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const onSetNewPassword = async () => {
    if (!token) {
      showSnack('error', 'Missing reset token')
      return
    }
    if (!password || !isValidPassword(password)) {
      showSnack('error', 'Please enter a valid password')
      return
    }
    if (password !== confirmPassword) {
      showSnack('error', 'Passwords do not match')
      return
    }

    try {
      setLoading(true)
      const response: any = await axios.post(Http.reset_password, {
        token,
        password,
      })

      if (response.result) {
        showSnack('success', 'Password updated. Please sign in.')
        setTimeout(() => {
          window.location.href = '/login'
        }, 800)
      } else {
        showSnack('error', response.message || 'Unable to reset password')
      }
    } catch (e) {
      showSnack('error', getApiErrorMessage(e))
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isLogin) {
      window.location.href = '/dashboard'
    }
  }, [isLogin])

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-screen-sm px-4">
        <div className="flex flex-col items-center pt-16 sm:pt-24">
          <SiteLogo />

          <h1 className="mt-8 text-center text-2xl font-bold tracking-tight">
            Welcome to your CryptoPay Server
          </h1>

          <Card className="mt-8 w-full max-w-[450px] border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">
                {token ? 'Set new password' : 'Forgot Password'}
              </CardTitle>
            </CardHeader>

            <CardContent>
              {!token ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') onSendResetEmail()
                      }}
                      placeholder="you@example.com"
                    />
                  </div>

                  <Button
                    className="mt-6 w-full"
                    size="lg"
                    onClick={onSendResetEmail}
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send reset email
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">New password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="confirm">Confirm password</Label>
                    <Input
                      id="confirm"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') onSetNewPassword()
                      }}
                    />
                  </div>

                  <Button
                    className="mt-6 w-full"
                    size="lg"
                    onClick={onSetNewPassword}
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update password
                  </Button>
                </>
              )}

              <Button
                className="mt-2 w-full"
                size="lg"
                variant="ghost"
                onClick={() => {
                  window.location.href = '/login'
                }}
              >
                Return to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
