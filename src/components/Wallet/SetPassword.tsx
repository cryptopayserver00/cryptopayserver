import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSnackPresistStore } from '@/lib/store/snack'
import { useStorePresistStore, useWalletPresistStore } from '@/lib/store'
import axios from '@/utils/http/axios'
import { getApiErrorMessage } from '@/utils/http/api-error'
import { Http } from '@/utils/http/http'
import { isValidPassword } from '@/utils/verify'
import { useShallow } from 'zustand/react/shallow'
import { WalletSetupLayout } from './WalletSetupLayout'

const CREATE_STEPS = ['Choose', 'Create', 'Secure', 'Backup']

const SetPassword = () => {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [accountPassword, setAccountPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [saving, setSaving] = useState(false)

  const { walletId, isWallet } = useWalletPresistStore(
    useShallow((state) => ({
      walletId: state.walletId,
      isWallet: state.isWallet,
    }))
  )

  const { isStore } = useStorePresistStore(
    useShallow((state) => ({
      isStore: state.isStore,
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

  const onClickConfirm = async () => {
    try {
      if (
        !password ||
        !confirmPassword ||
        !accountPassword ||
        !isValidPassword(password) ||
        !isValidPassword(confirmPassword) ||
        password !== confirmPassword
      ) {
        showSnack('error', 'Please enter a valid password')
        return
      }

      if (!walletId) {
        showSnack('error', 'Wallet not found. Please create a wallet first.')
        return
      }

      setSaving(true)
      const response: any = await axios.put(Http.update_pwd_by_wallet_id, {
        wallet_id: walletId,
        password,
        account_password: accountPassword,
      })

      if (!response.result) {
        showSnack('error', response.message || 'Update failed!')
        return
      }

      showSnack('success', 'Wallet password saved')

      if (response.data.isBackup === 1) {
        router.push('/dashboard')
      } else if (response.data.isBackup === 2) {
        router.push('/wallet/phrase/intro')
      } else {
        showSnack('error', 'Unexpected wallet backup state')
      }
    } catch (e) {
      showSnack('error', getApiErrorMessage(e))
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!isStore) {
      router.push('/stores/create')
    }
  }, [isStore, router])

  // From dashboard warning the wallet already exists — don't send users back to create/choose.
  const existingWallet = Boolean(isWallet && walletId)

  return (
    <WalletSetupLayout
      title="Set a wallet password"
      description="This password unlocks wallet keys on your server. We cannot recover it for you."
      steps={existingWallet ? undefined : CREATE_STEPS}
      currentStep={existingWallet ? undefined : 3}
      backHref="/dashboard"
      backLabel="Back to dashboard"
    >
      <div className="space-y-5">
        <Alert>
          <ShieldCheck className="h-4 w-4" />
          <AlertDescription>
            Use a strong unique password. You’ll need your account password to confirm this change.{' '}
            <Link
              href="https://docs.cryptopayserver.online"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-2"
            >
              Learn more
            </Link>
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="account-password">Account password</Label>
          <Input
            id="account-password"
            type="password"
            value={accountPassword}
            onChange={(e) => setAccountPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="Your CryptoPayServer login password"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="wallet-password">New wallet password</Label>
          <div className="relative">
            <Input
              id="wallet-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
              autoComplete="new-password"
              placeholder="At least 8 characters"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-wallet-password">Confirm wallet password</Label>
          <div className="relative">
            <Input
              id="confirm-wallet-password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pr-10"
              autoComplete="new-password"
              onKeyDown={(e) => {
                if (e.key === 'Enter') onClickConfirm()
              }}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button onClick={onClickConfirm} disabled={saving} className="min-w-36 gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? 'Saving...' : 'Continue'}
          </Button>
          <Button
            variant="ghost"
            disabled={saving}
            onClick={() => router.push('/dashboard')}
          >
            Skip for now
          </Button>
        </div>
      </div>
    </WalletSetupLayout>
  )
}

export default SetPassword
