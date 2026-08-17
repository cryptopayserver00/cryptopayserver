import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSnackPresistStore, useUserPresistStore } from '@/lib/store'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { IsValidEmail } from '@/utils/verify'
import { SiteLogo } from '../Logo/SiteLogo'
import { useShallow } from 'zustand/react/shallow'

const ForgotPassword = () => {
  const [email, setEmail] = useState<string>('')
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

  const onResetPassword = async () => {
    if (!email || !IsValidEmail(email)) {
      showSnack('error', 'Incorrect email input')
      return
    }

    try {
      setLoading(true)
      const response: any = await axios.get(Http.send_reset_email, {
        params: { email },
      })

      if (response.result) {
        showSnack('success', 'Email already sent')
      } else {
        showSnack('error', 'Incorrect email')
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
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
              <CardTitle className="text-2xl">Forgot Password</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onResetPassword()
                  }}
                  placeholder="you@example.com"
                />
              </div>

              <Button
                className="mt-6 w-full"
                size="lg"
                onClick={onResetPassword}
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send reset email
              </Button>

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
