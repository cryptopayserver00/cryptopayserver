import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Eye, EyeOff, Loader2, ShieldAlert } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useSnackPresistStore } from '@/lib/store/snack'
import { useStorePresistStore, useWalletPresistStore } from '@/lib/store'
import axios from '@/utils/http/axios'
import { getApiErrorMessage } from '@/utils/http/api-error'
import { Http } from '@/utils/http/http'
import { cn } from '@/lib/utils'
import { useShallow } from 'zustand/react/shallow'
import { WalletSetupLayout } from '../../WalletSetupLayout'

const CREATE_STEPS = ['Choose', 'Create', 'Secure', 'Backup']

const PhraseBackup = () => {
  const router = useRouter()
  const [phrase, setPhrase] = useState<string[]>([])
  const [revealed, setRevealed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

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

  const revealMnemonic = async () => {
    if (!isWallet || !walletId || loading) return

    try {
      setLoading(true)

      const meta: any = await axios.get(Http.find_wallet_by_id, {
        params: { id: walletId },
      })
      if (!meta.result) {
        showSnack('error', 'Cannot find the wallet, please try again later.')
        return
      }

      const { promptAccountPassword, promptWalletPasswordIfNeeded } = await import(
        '@/utils/wallet-password'
      )
      const accountPassword = await promptAccountPassword(
        'Enter your account password to view the mnemonic'
      )
      if (!accountPassword) return

      let walletPassword = ''
      if (meta.data?.hasPassword) {
        const entered = await promptWalletPasswordIfNeeded(walletId)
        if (!entered) return
        walletPassword = entered
      }

      const response: any = await axios.post(Http.find_wallet_by_id, {
        id: walletId,
        reveal: 1,
        account_password: accountPassword,
        wallet_password: walletPassword,
      })

      if (response.result && response.data?.mnemonic) {
        const words = String(response.data.mnemonic)
          .trim()
          .split(/\s+/)
          .filter(Boolean)
        setPhrase(words)
        setRevealed(true)
      } else {
        showSnack('error', response.message || 'Cannot find the wallet, please try again later.')
      }
    } catch (e) {
      showSnack('error', getApiErrorMessage(e))
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const onCopy = async () => {
    if (!phrase.length) return
    try {
      await navigator.clipboard.writeText(phrase.join(' '))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      showSnack('error', 'Unable to copy to clipboard')
    }
  }

  useEffect(() => {
    if (!isStore) {
      router.push('/stores/create')
      return
    }
    if (!isWallet || !walletId) {
      router.push('/dashboard')
    }
  }, [isStore, isWallet, walletId, router])

  return (
    <WalletSetupLayout
      title="Record your mnemonic phrase"
      description="Write these words down offline and keep them safe. Anyone with this phrase can control the wallet."
      steps={CREATE_STEPS}
      currentStep={4}
      backHref="/wallet/phrase/intro"
    >
      <div className="space-y-5">
        <Alert>
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Keep this private</AlertTitle>
          <AlertDescription>
            Connected devices can leak information. Prefer handwriting the phrase and never share it
            with anyone.
          </AlertDescription>
        </Alert>

        <Card className="overflow-hidden shadow-none">
          <CardContent className="p-0">
            {!revealed ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 bg-slate-950 px-6 py-12 text-center text-white">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-white/80" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold">Mnemonic phrase is hidden</p>
                  <p className="text-sm text-white/60">
                    Make sure nobody can see your screen, then reveal it.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  className="mt-2 gap-2"
                  disabled={loading}
                  onClick={revealMnemonic}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  {loading ? 'Unlocking...' : 'Reveal mnemonic phrase'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4 p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {phrase.length} words · tap a word only to read it
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={onCopy}>
                      <Copy className="h-3.5 w-3.5" />
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setRevealed(false)}
                    >
                      <EyeOff className="h-3.5 w-3.5" />
                      Hide
                    </Button>
                  </div>
                </div>

                <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {phrase.map((word, index) => (
                    <li
                      key={`${index}-${word}`}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2.5',
                        'text-sm font-medium'
                      )}
                    >
                      <span className="w-5 shrink-0 text-xs text-muted-foreground">
                        {index + 1}.
                      </span>
                      <span className="truncate font-mono tracking-wide">{word}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button
            disabled={!revealed || phrase.length === 0}
            onClick={() => router.push('/wallet/phrase/backup/confirm')}
          >
            I have finished recording
          </Button>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Backup later
          </Button>
        </div>
      </div>
    </WalletSetupLayout>
  )
}

export default PhraseBackup
