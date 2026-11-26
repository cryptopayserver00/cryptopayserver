import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useSnackPresistStore,
  useStorePresistStore,
  useUserPresistStore,
  useWalletPresistStore,
} from '@/lib/store'
import axios from '@/utils/http/axios'
import { getApiErrorMessage } from '@/utils/http/api-error'
import { Http } from '@/utils/http/http'
import { useShallow } from 'zustand/react/shallow'

const ImportMnemonicPhrase = () => {
  const router = useRouter()
  const [bit, setBit] = useState<number>(12)
  const [numbers, setNumbers] = useState<number[]>([])
  const [phrase, setPhrase] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const { userId } = useUserPresistStore(
    useShallow((state) => ({
      userId: state.userId,
    }))
  )

  const { setWalletId, setIsWallet } = useWalletPresistStore(
    useShallow((state) => ({
      setWalletId: state.setWalletId,
      setIsWallet: state.setIsWallet,
    }))
  )

  const { storeId, isStore } = useStorePresistStore(
    useShallow((state) => ({
      storeId: state.storeId,
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

  const handlePhraseChange = (value: string, index: number) => {
    const next = [...phrase]
    next[index] = value.trim()
    setPhrase(next)
  }

  const walletToBlockScan = async (walletId: string | number) => {
    try {
      const response: any = await axios.post(Http.create_wallet_to_block_scan, {
        user_id: userId,
        wallet_id: walletId,
      })
      if (!response.result) {
        showSnack('error', 'Some addresses could not join block scanning. You can retry later.')
      }
    } catch (e) {
      showSnack('error', 'Some addresses could not join block scanning. You can retry later.')
      console.error(e)
    }
  }

  const handleButtonClick = async () => {
    if (!phrase || phrase.filter((element) => element).length !== bit) {
      showSnack('error', 'Please fill in every word of the mnemonic phrase')
      return
    }

    try {
      setSubmitting(true)

      const existing: any = await axios.get(Http.find_wallet, {
        params: { store_id: storeId },
      })

      if (existing.result) {
        setWalletId(existing.data.id)
        setIsWallet(true)
        showSnack('success', 'This store already has a wallet')
        router.push('/dashboard')
        return
      }

      const { promptAccountPassword } = await import('@/utils/wallet-password')
      const accountPassword = await promptAccountPassword(
        'Enter your account password to import wallet'
      )
      if (accountPassword === null) return

      const import_wallet_resp: any = await axios.post(Http.save_wallet, {
        import_wallet: phrase.join(' '),
        store_id: storeId,
        user_id: userId,
        account_password: accountPassword,
      })

      if (!import_wallet_resp.result) {
        showSnack('error', import_wallet_resp.message || 'Unable to import this wallet')
        return
      }

      setWalletId(import_wallet_resp.data.walletId)
      setIsWallet(true)
      showSnack('success', 'Wallet imported')
      await walletToBlockScan(import_wallet_resp.data.walletId)
      router.push('/wallet/setPassword')
    } catch (e) {
      showSnack('error', getApiErrorMessage(e))
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    setNumbers(Array.from({ length: bit }, (_, index) => index))
    setPhrase(Array.from({ length: bit }, () => ''))
  }, [bit])

  useEffect(() => {
    if (!isStore) {
      router.push('/stores/create')
    }
  }, [isStore, router])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Label htmlFor="mnemonic-length">Phrase length</Label>
        <Select
          value={String(bit)}
          onValueChange={(value) => setBit(Number(value))}
        >
          <SelectTrigger id="mnemonic-length" className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12">12 words</SelectItem>
            <SelectItem value="24">24 words</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {numbers.map((index) => (
          <div key={index} className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-8 items-center justify-center text-xs text-muted-foreground">
              {index + 1}
            </span>
            <Input
              value={phrase[index] || ''}
              onChange={(e) => handlePhraseChange(e.target.value, index)}
              className="pl-8"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              disabled={submitting}
            />
          </div>
        ))}
      </div>

      <Button onClick={handleButtonClick} disabled={submitting} className="min-w-40 gap-2">
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? 'Importing...' : 'Import wallet'}
      </Button>
    </div>
  )
}

export default ImportMnemonicPhrase
