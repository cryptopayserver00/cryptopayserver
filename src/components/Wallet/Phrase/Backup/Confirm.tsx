import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ShieldCheck } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useSnackPresistStore } from '@/lib/store/snack'
import { useStorePresistStore, useWalletPresistStore } from '@/lib/store'
import axios from '@/utils/http/axios'
import { getApiErrorMessage } from '@/utils/http/api-error'
import { Http } from '@/utils/http/http'
import { RandomWords, AddAndShuffleArray, GetUniqueRandomIndices } from '@/utils/strings'
import { cn } from '@/lib/utils'
import { useShallow } from 'zustand/react/shallow'
import { WalletSetupLayout } from '../../WalletSetupLayout'

const CREATE_STEPS = ['Choose', 'Create', 'Secure', 'Backup']

type SelectMems = {
  index: number
  selectArrays: string[]
  value: string
}

const PhraseBackupConfirm = () => {
  const router = useRouter()
  const [selectMems, setSelectMems] = useState<SelectMems[]>([])
  const [phrase, setPhrase] = useState<string[]>([])
  const [selectWord, setSelectWord] = useState<Record<number, string>>({})
  const [accountPassword, setAccountPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const submittedRef = useRef(false)

  const { isWallet, walletId } = useWalletPresistStore(
    useShallow((state) => ({
      isWallet: state.isWallet,
      walletId: state.walletId,
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

  const showSnack = (severity: 'success' | 'error' | 'warning', message: string) => {
    setSnackSeverity(severity)
    setSnackMessage(message)
    setSnackOpen(true)
  }

  const updateWalletBackup = async () => {
    if (submittedRef.current || submitting) return
    submittedRef.current = true
    setSubmitting(true)

    try {
      let password = accountPassword
      if (!password) {
        const { promptAccountPassword } = await import('@/utils/wallet-password')
        const entered = await promptAccountPassword(
          'Enter your account password to confirm backup'
        )
        if (!entered) {
          submittedRef.current = false
          return
        }
        password = entered
        setAccountPassword(entered)
      }

      const response: any = await axios.put(Http.update_backup_by_wallet_id, {
        wallet_id: walletId,
        account_password: password,
      })

      if (response.result) {
        showSnack('success', 'Mnemonic phrase confirmed')
        router.push('/dashboard')
        return
      }

      submittedRef.current = false
      showSnack('error', response.message || 'Unable to confirm backup')
    } catch (e) {
      submittedRef.current = false
      showSnack('error', getApiErrorMessage(e))
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  const fetchWalletData = async () => {
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
      const enteredAccountPassword = await promptAccountPassword(
        'Enter your account password to continue'
      )
      if (!enteredAccountPassword) return
      setAccountPassword(enteredAccountPassword)

      let walletPassword = ''
      if (meta.data?.hasPassword) {
        const entered = await promptWalletPasswordIfNeeded(walletId)
        if (!entered) return
        walletPassword = entered
      }

      const response: any = await axios.post(Http.find_wallet_by_id, {
        id: walletId,
        reveal: 1,
        account_password: enteredAccountPassword,
        wallet_password: walletPassword,
      })

      if (response.result && response.data?.mnemonic) {
        const phraseArray = String(response.data.mnemonic)
          .trim()
          .split(/\s+/)
          .filter(Boolean)
        setPhrase(phraseArray)

        const randomIndices = GetUniqueRandomIndices(phraseArray.length, 3).map(
          (index) => index + 1
        )

        const createMem = (index: number) => ({
          index,
          selectArrays: AddAndShuffleArray(RandomWords(2), phraseArray[index - 1]),
          value: phraseArray[index - 1],
        })

        setSelectMems(randomIndices.map(createMem).sort((a, b) => a.index - b.index))
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

  useEffect(() => {
    if (!isStore) {
      router.push('/stores/create')
      return
    }
    if (!isWallet || !walletId) {
      router.push('/dashboard')
      return
    }
    fetchWalletData()
    // Intentionally once on mount for this wallet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStore, isWallet, walletId])

  const handleButtonClick = (index: number, selectItem: string) => {
    if (submitting) return
    setSelectWord((prev) => ({
      ...prev,
      [index]: selectItem,
    }))
  }

  const onConfirmSelection = async () => {
    if (Object.keys(selectWord).length !== 3 || submitting) return

    let matchTime = 0
    for (const word of Object.keys(selectWord)) {
      const idx = parseInt(word, 10)
      if (phrase[idx - 1] === selectWord[idx]) {
        matchTime += 1
      }
    }

    if (matchTime === 3) {
      await updateWalletBackup()
    } else {
      setSelectWord({})
      showSnack('warning', 'Matching errors, please try again')
    }
  }

  return (
    <WalletSetupLayout
      title="Confirm your mnemonic phrase"
      description="Select the correct word for each prompted position to prove you recorded the phrase."
      steps={CREATE_STEPS}
      currentStep={4}
      backHref="/wallet/phrase/backup"
    >
      <div className="space-y-5">
        <Alert>
          <ShieldCheck className="h-4 w-4" />
          <AlertDescription>
            This check ensures you wrote the phrase down correctly before marking the wallet as
            backed up.
          </AlertDescription>
        </Alert>

        {loading || selectMems.length === 0 ? (
          <Card className="shadow-none">
            <CardContent className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Preparing confirmation quiz...
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-none">
            <CardContent className="space-y-6 p-5 sm:p-6">
              {selectMems.map((item) => (
                <div key={item.index} className="space-y-3 border-b pb-5 last:border-0 last:pb-0">
                  <p className="text-sm font-medium">
                    Word <span className="text-primary">#{item.index}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {item.selectArrays.map((selectItem) => {
                      const isSelected = selectWord[item.index] === selectItem
                      return (
                        <button
                          key={`${item.index}-${selectItem}`}
                          type="button"
                          disabled={submitting}
                          onClick={() => handleButtonClick(item.index, selectItem)}
                          className={cn(
                            'min-w-[96px] rounded-lg border px-4 py-2 text-sm font-medium transition',
                            isSelected
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border bg-background hover:bg-muted/50'
                          )}
                        >
                          {selectItem}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Button
          disabled={Object.keys(selectWord).length !== 3 || submitting || loading}
          onClick={onConfirmSelection}
          className="min-w-40 gap-2"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? 'Confirming...' : 'Confirm backup'}
        </Button>
      </div>
    </WalletSetupLayout>
  )
}

export default PhraseBackupConfirm
