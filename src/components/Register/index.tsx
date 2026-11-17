import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSnackPresistStore } from '@/lib/store/snack'
import { useUserPresistStore } from '@/lib/store'
import axios from '@/utils/http/axios'
import { getApiErrorMessage } from '@/utils/http/api-error'
import { Http } from '@/utils/http/http'
import { isValidPassword, IsValidEmail } from '@/utils/verify'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SiteLogo } from '../Logo/SiteLogo'
import { useShallow } from 'zustand/react/shallow'

const registrationDisabled =
  process.env.NEXT_PUBLIC_DISABLE_PUBLIC_REGISTRATION === 'true'

const Register = () => {
  const router = useRouter()

  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

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

  useEffect(() => {
    if (isLogin) {
      window.location.href = '/dashboard'
    }
  }, [isLogin])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onRegister()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 flex flex-col items-center">
        <div className="flex flex-col items-center text-center space-y-3">
          <SiteLogo />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome to your CryptoPay Server
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            A self-hosted, open-source crypto payment processor. It is secure, private,
            censorship-resistant and free.
          </p>
        </div>

        <Card className="w-full shadow-lg border">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Create account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {registrationDisabled ? (
              <>
                <Alert>
                  <AlertDescription>
                    Public registration is disabled on this instance. Ask an administrator for an
                    invite or account.
                  </AlertDescription>
                </Alert>
                <Button variant="outline" size="lg" className="w-full" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <Button size="lg" className="w-full" onClick={onRegister} disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create account'}
                  </Button>

                  <Button variant="outline" size="lg" className="w-full" asChild>
                    <Link href="/login">Log in</Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Register
