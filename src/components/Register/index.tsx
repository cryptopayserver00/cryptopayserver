import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { AuthShell } from '@/components/Auth/AuthShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSnackPresistStore } from '@/lib/store/snack'
import axios from '@/utils/http/axios'
import { getApiErrorMessage } from '@/utils/http/api-error'
import { Http } from '@/utils/http/http'
import { isValidPassword, IsValidEmail } from '@/utils/verify'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useShallow } from 'zustand/react/shallow'
import { useRedirectIfAuthenticated } from '@/hooks/useRedirectIfAuthenticated'

const registrationDisabled =
  process.env.NEXT_PUBLIC_DISABLE_PUBLIC_REGISTRATION === 'true'

const Register = () => {
  const router = useRouter()

  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useRedirectIfAuthenticated()

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      setSnackSeverity: state.setSnackSeverity,
      setSnackMessage: state.setSnackMessage,
      setSnackOpen: state.setSnackOpen,
    }))
  )

  const onRegister = async () => {
    try {
      if (registrationDisabled) {
        setSnackSeverity('error')
        setSnackMessage('Public registration is disabled')
        setSnackOpen(true)
        return
      }
      if (!email || email === '' || !IsValidEmail(email)) {
        setSnackSeverity('error')
        setSnackMessage('Please enter a valid email')
        setSnackOpen(true)
        return
      }

      if (
        !password ||
        !confirmPassword ||
        !isValidPassword(password) ||
        !isValidPassword(confirmPassword) ||
        password !== confirmPassword
      ) {
        setSnackSeverity('error')
        setSnackMessage('Please enter a valid password')
        setSnackOpen(true)
        return
      }

      setIsLoading(true)

      const create_user_resp: any = await axios.post(Http.create_user, {
        email: email,
        password: password,
      })
      if (create_user_resp.result) {
        setSnackSeverity('success')
        setSnackMessage('Created successfully!')
        setSnackOpen(true)
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      } else {
        setSnackSeverity('error')
        setSnackMessage(create_user_resp.message || 'Unable to create account')
        setSnackOpen(true)
        setIsLoading(false)
      }
    } catch (e) {
      setIsLoading(false)
      setSnackSeverity('error')
      setSnackMessage(getApiErrorMessage(e))
      setSnackOpen(true)
      console.error(e)
    }
  }

  useEffect(() => {
    const enterEmail = router.query.email
    if (enterEmail) {
      setEmail(enterEmail as string)
    }
  }, [router.query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onRegister()
    }
  }

  return (
    <AuthShell
      title="Create account"
      subtitle="Spin up a self-hosted payment gateway for invoices, multi-chain wallets, and payouts — your keys stay with you."
    >
      {registrationDisabled ? (
        <div className="space-y-5">
          <Alert className="border-slate-200 bg-slate-50">
            <AlertDescription className="text-slate-600">
              Public registration is disabled on this instance. Ask an administrator for an invite
              or account.
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            size="lg"
            className="h-11 w-full border-slate-200"
            asChild
          >
            <Link href="/login">Back to sign in</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-11 border-slate-200 bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-11 border-slate-200 bg-white"
            />
          </div>

          <Button
            size="lg"
            className="h-11 w-full bg-teal-800 text-white hover:bg-teal-700"
            onClick={onRegister}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-teal-800 hover:text-teal-700">
              Sign in
            </Link>
          </p>
        </div>
      )}
    </AuthShell>
  )
}

export default Register
