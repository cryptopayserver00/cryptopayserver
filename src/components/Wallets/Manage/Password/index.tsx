import { useEffect, useState } from 'react'
import { Check, Eye, EyeOff, X } from 'lucide-react'
import { useSnackPresistStore, useWalletPresistStore } from '@/lib/store'
import axios from '@/utils/http/axios'
import { getApiErrorMessage } from '@/utils/http/api-error'
import { Http } from '@/utils/http/http'
import { isValidPassword } from '@/utils/verify'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useShallow } from 'zustand/react/shallow'

const ManagePassword = () => {
  const [password, setPassword] = useState<string>('')
  const [isPassword, setIsPassword] = useState<boolean>(false)
  const [openSetPassword, setOpenSetPassword] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState(false)

  const { walletId } = useWalletPresistStore(
    useShallow((state) => ({
      walletId: state.walletId,
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

  const onClickSetPassword = async () => {
    try {
      if (!password || !isValidPassword(password)) {
        showSnack('error', 'Please enter a valid password')
        return
      }

      let oldPassword = ''
      let accountPassword = ''
      if (isPassword) {
        const { promptWalletPasswordIfNeeded } = await import('@/utils/wallet-password')
        const entered = await promptWalletPasswordIfNeeded(walletId)
        if (!entered) return
        oldPassword = entered
      } else {
        const { promptAccountPassword } = await import('@/utils/wallet-password')
        const entered = await promptAccountPassword(
          'Enter your account password to set a wallet password'
        )
        if (!entered) return
        accountPassword = entered
      }

      const response: any = await axios.put(Http.update_pwd_by_wallet_id, {
        wallet_id: walletId,
        password: password,
        old_password: oldPassword,
        account_password: accountPassword,
      })
      if (response.result) {
        showSnack('success', 'Updated successfully!')
        await init(walletId)
        setOpenSetPassword(false)
      } else {
        showSnack('error', response.message || 'Update failed!')
      }
    } catch (e) {
      showSnack('error', getApiErrorMessage(e))
      console.error(e)
    }
  }

  const init = async (walletId: number) => {
    setPassword('')

    try {
      const response: any = await axios.get(Http.find_wallet_by_id, {
        params: {
          id: walletId,
        },
      })

      if (response.result && (response.data.hasPassword || response.data.password)) {
        setIsPassword(true)
      } else {
        setIsPassword(false)
      }
    } catch (e) {
      showSnack('error', getApiErrorMessage(e))
      console.error(e)
    }
  }

  useEffect(() => {
    init(walletId)
  }, [walletId])

  return (
    <div>
      <div className="mx-auto max-w-screen-lg px-4">
        <h2 className="text-lg font-semibold">Payment Password</h2>

        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Detect Password Binding Status</span>
              {isPassword ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <X className="h-5 w-5 text-destructive" />
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="font-semibold">Operate</span>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setOpenSetPassword(true)}
              >
                {isPassword ? 'Change Password' : 'Set Password'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={openSetPassword} onOpenChange={setOpenSetPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Password</DialogTitle>
            <DialogDescription>
              Setting up complex passwords can protect your assets.
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Input
              autoFocus
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onClickSetPassword()
              }}
              className="pr-10"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((show) => !show)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenSetPassword(false)}>
              Cancel
            </Button>
            <Button onClick={onClickSetPassword}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ManagePassword
