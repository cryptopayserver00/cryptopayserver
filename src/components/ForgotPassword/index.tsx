import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

import { AuthShell } from '@/components/Auth/AuthShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSnackPresistStore } from '@/lib/store'
import { useRedirectIfAuthenticated } from '@/hooks/useRedirectIfAuthenticated'
import axios from '@/utils/http/axios'
import { getApiErrorMessage } from '@/utils/http/api-error'
import { Http } from '@/utils/http/http'
import { IsValidEmail, isValidPassword } from '@/utils/verify'
import { useShallow } from 'zustand/react/shallow'

const ForgotPassword = () => {
  const router = useRouter()
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [token, setToken] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useRedirectIfAuthenticated()

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

  return (
    <AuthShell
      title={token ? 'Set a new password' : 'Reset password'}
      subtitle={
        token
          ? 'Choose a strong password for your CryptoPayServer account.'
          : 'We will email a reset link if an account exists for that address. SMTP must be configured on this instance.'
      }
    >
      {!token ? (
        <div className="space-y-5">
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
              className="h-11 border-slate-200 bg-white"
            />
          </div>

          <Button
            className="h-11 w-full bg-teal-800 text-white hover:bg-teal-700"
            size="lg"
            onClick={onSendResetEmail}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send reset email
          </Button>

          <p className="text-center text-sm text-slate-500">
            Remembered it?{' '}
            <Link href="/login" className="font-medium text-teal-800 hover:text-teal-700">
              Back to sign in
            </Link>
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 border-slate-200 bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSetNewPassword()
              }}
              className="h-11 border-slate-200 bg-white"
            />
          </div>

          <Button
            className="h-11 w-full bg-teal-800 text-white hover:bg-teal-700"
            size="lg"
            onClick={onSetNewPassword}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update password
          </Button>

          <p className="text-center text-sm text-slate-500">
            <Link href="/login" className="font-medium text-teal-800 hover:text-teal-700">
              Back to sign in
            </Link>
          </p>
        </div>
      )}
    </AuthShell>
  )
}

export default ForgotPassword
