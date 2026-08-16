import { useEffect, useState } from 'react'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { ArrowLeft, Copy, Check, Shield, ShieldOff, RefreshCw, Eye, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useSnackPresistStore, useUserPresistStore } from '@/lib/store'
import { GenerateAuthenticatorSecret, VerifyAuthenticator } from '@/utils/totp'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { useShallow } from 'zustand/react/shallow'

const Authentication = () => {
  const [page, setPage] = useState<number>(1)
  const [isSetup, setIsSetup] = useState<boolean>(false)
  const [text, setText] = useState<string>('')
  const [qrCode, setQrCode] = useState<string>('')
  const [code, setCode] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  const { userEmail } = useUserPresistStore(
    useShallow((state) => ({
      userEmail: state.userEmail,
    }))
  )

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      setSnackSeverity: state.setSnackSeverity,
      setSnackMessage: state.setSnackMessage,
      setSnackOpen: state.setSnackOpen,
    }))
  )

  const init = async (userEmail: string) => {
    try {
      if (!userEmail) return

      const response: any = await axios.get(Http.find_user_by_email, {
        params: {
          email: userEmail,
        },
      })

      if (response.result && response.data.authenticator && response.data.authenticator !== '') {
        setIsSetup(true)
        setText(response.data.authenticator)
        const link = `otpauth://totp/CryptoPayServer:${userEmail}?secret=${
          response.data.authenticator
        }&issuer=CryptoPayServer&digits=6`
        setQrCode(link)
        setPage(1)
      } else {
        setIsSetup(false)
        const token = GenerateAuthenticatorSecret()
        setText(token)
        const link = `otpauth://totp/CryptoPayServer:${userEmail}?secret=${token}&issuer=CryptoPayServer&digits=6`
        setQrCode(link)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  useEffect(() => {
    init(userEmail)
  }, [userEmail])

  const onClickResetApp = async () => {
    try {
      setIsResetting(true)
      const response: any = await axios.put(Http.update_user_by_email, {
        email: userEmail,
        authenticator: '',
      })

      if (response.result) {
        setSnackSeverity('success')
        setSnackMessage('Reset successful!')
        setSnackOpen(true)
        await init(userEmail)
        setPage(2)
      } else {
        setSnackSeverity('error')
        setSnackMessage('Reset failed!')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    } finally {
      setIsResetting(false)
    }
  }

  const onClickVerify = async () => {
    if (!text || !code) return

    if (VerifyAuthenticator(code, text)) {
      try {
        setIsVerifying(true)
        const response: any = await axios.put(Http.update_user_by_email, {
          email: userEmail,
          authenticator: text,
        })

        if (response.result) {
          setSnackSeverity('success')
          setSnackMessage('Save successful!')
          setSnackOpen(true)
          await init(userEmail)
        } else {
          setSnackSeverity('error')
          setSnackMessage('Authentication failed!')
          setSnackOpen(true)
        }
      } catch (e) {
        setSnackSeverity('error')
        setSnackMessage('The network error occurred. Please try again later.')
        setSnackOpen(true)
        console.error(e)
      } finally {
        setIsVerifying(false)
        clearData()
      }
    } else {
      setSnackMessage('Verification failed!')
      setSnackSeverity('error')
      setSnackOpen(true)
    }
  }

  const clearData = () => {
    setCode('')
  }

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setSnackMessage('Successfully copied')
      setSnackSeverity('success')
      setSnackOpen(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setSnackSeverity('error')
      setSnackMessage('Failed to copy')
      setSnackOpen(true)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {page === 1 && (
        <>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Two-Factor Authentication</h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Two-Factor Authentication (2FA) is an additional measure to protect your account. In
              addition to your password you will be asked for a second proof on login. This can be
              provided by an app (such as Google or Microsoft Authenticator) or a security device
              (like a Yubikey or your hardware wallet supporting FIDO2).
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-medium">App-based 2FA</h2>
            </div>

            {isSetup ? (
              <div className="space-y-4">
                <Card className="border-destructive/40">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ShieldOff className="h-4 w-4 text-destructive" />
                      Disable 2FA
                    </CardTitle>
                    <CardDescription>
                      Re-enabling will not require you to reconfigure your app.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="destructive"
                      onClick={onClickResetApp}
                      disabled={isResetting}
                      className="gap-2"
                    >
                      <ShieldOff className="h-4 w-4" />
                      {isResetting ? 'Disabling...' : 'Disable'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Reset app
                    </CardTitle>
                    <CardDescription>
                      Invalidates the current authenticator configuration. Useful if you believe
                      your authenticator settings were compromised.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      onClick={onClickResetApp}
                      disabled={isResetting}
                      className="gap-2 border-amber-500/50 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/30"
                    >
                      <RefreshCw className="h-4 w-4" />
                      {isResetting ? 'Resetting...' : 'Reset'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Configure app
                    </CardTitle>
                    <CardDescription>
                      Display the key or QR code to configure an authenticator app with your current
                      setup.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => {
                        setPage(2)
                        clearData()
                      }}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Check
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    Enable 2FA
                  </CardTitle>
                  <CardDescription>
                    Using apps such as Google or Microsoft Authenticator.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => {
                      setPage(2)
                      clearData()
                    }}
                    className="gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Enable
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      {page === 2 && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Enable Authenticator App</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Follow the steps below to set up two-factor authentication
              </p>
            </div>
            <Button variant="outline" onClick={() => setPage(1)} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-8">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    1
                  </span>
                  <p className="text-sm font-medium">Download a two-factor authenticator app</p>
                </div>
                <ul className="ml-10 space-y-1.5 text-sm text-muted-foreground">
                  <li>
                    Authy for{' '}
                    <Link
                      href="https://play.google.com/store/apps/details?id=com.authy.authy"
                      target="_blank"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      Android
                    </Link>{' '}
                    or{' '}
                    <Link
                      href="https://apps.apple.com/us/app/authy/id494168017"
                      target="_blank"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      iOS
                    </Link>
                  </li>
                  <li>
                    Microsoft Authenticator for{' '}
                    <Link
                      href="https://play.google.com/store/apps/details?id=com.azure.authenticator"
                      target="_blank"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      Android
                    </Link>{' '}
                    or{' '}
                    <Link
                      href="https://apps.apple.com/us/app/microsoft-authenticator/id983156458"
                      target="_blank"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      iOS
                    </Link>
                  </li>
                  <li>
                    Google Authenticator for{' '}
                    <Link
                      href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en"
                      target="_blank"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      Android
                    </Link>{' '}
                    or{' '}
                    <Link
                      href="https://apps.apple.com/us/app/google-authenticator/id388497605"
                      target="_blank"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      iOS
                    </Link>
                  </li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    2
                  </span>
                  <p className="text-sm font-medium">
                    Scan the QR Code or enter the key into your authenticator app
                  </p>
                </div>

                <div className="ml-10 space-y-4">
                  <div className="space-y-2">
                    <Label>Secret key</Label>
                    <div className="flex gap-2">
                      <Input value={text} readOnly className="font-mono text-sm" />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copySecret}
                        className="shrink-0"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="inline-flex rounded-xl border bg-white p-4 shadow-sm">
                    <QRCodeSVG
                      value={qrCode}
                      width={200}
                      height={200}
                      // imageSettings={{
                      //   src: '',
                      //   width: 35,
                      //   height: 35,
                      //   excavate: false,
                      // }}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    3
                  </span>
                  <p className="text-sm font-medium">
                    Enter the verification code from your authenticator app
                  </p>
                </div>

                <div className="ml-10 space-y-4">
                  <div className="space-y-2 max-w-xs">
                    <Label htmlFor="code">Verification Code</Label>
                    <Input
                      id="code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="000000"
                      maxLength={6}
                      className="font-mono tracking-widest text-center text-lg"
                    />
                  </div>

                  <Button onClick={onClickVerify} disabled={isVerifying || !code} className="gap-2">
                    <Shield className="h-4 w-4" />
                    {isVerifying ? 'Verifying...' : 'Verify'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default Authentication
