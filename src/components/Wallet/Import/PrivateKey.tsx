import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store'
import { CHAINNAMES } from '@/packages/constants/blockchain'
import axios from '@/utils/http/axios'
import { getApiErrorMessage } from '@/utils/http/api-error'
import { Http } from '@/utils/http/http'
import { FindChainIdsByChainNames } from '@/utils/web3'
import { validateImportPrivateKey } from '@/utils/verify'
import { useShallow } from 'zustand/react/shallow'

const ImportPrivateKey = () => {
  const router = useRouter()
  const [chainName, setChainName] = useState<CHAINNAMES>(CHAINNAMES.BITCOIN)
  const [privateKey, setPrivateKey] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { userId, network } = useUserPresistStore(
    useShallow((state) => ({
      userId: state.userId,
      network: state.network,
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

  const handleButtonClick = async () => {
    try {
      if (!chainName || !Object.values(CHAINNAMES).includes(chainName)) {
        showSnack('error', 'Please select a chain')
        return
      }

      const chainId = FindChainIdsByChainNames(chainName)
      const validationError = validateImportPrivateKey(chainId, privateKey)
      if (validationError) {
        showSnack('error', validationError)
        return
      }

      setSubmitting(true)
      const { promptAccountPassword } = await import('@/utils/wallet-password')
      const accountPassword = await promptAccountPassword(
        'Enter your account password to import private key'
      )
      if (accountPassword === null) return

      const response: any = await axios.post(Http.save_wallet_by_private_key, {
        user_id: userId,
        store_id: storeId,
        chain_id: chainId,
        network: network === 'mainnet' ? 1 : 2,
        private_key: privateKey.trim(),
        account_password: accountPassword,
      })

      if (response.result) {
        showSnack('success', 'Private key imported')
        router.push('/dashboard')
      } else {
        showSnack('error', response.message || 'Import failed')
      }
    } catch (e) {
      showSnack('error', getApiErrorMessage(e))
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (!isStore) {
      router.push('/stores/create')
    }
  }, [isStore, router])

  return (
    <div className="max-w-xl space-y-5">
      <div className="space-y-2">
        <Label>Chain</Label>
        <Select
          value={chainName}
          onValueChange={(value) => setChainName(value as CHAINNAMES)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select chain" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(CHAINNAMES).map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="private-key-input">Private key</Label>
        <Textarea
          id="private-key-input"
          rows={8}
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
          placeholder="64-character hex private key (optional 0x prefix)"
          disabled={submitting}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Bitcoin / EVM / Tron expect a 32-byte hex key. Invalid keys are rejected before import.
        </p>
      </div>

      <Button onClick={handleButtonClick} disabled={submitting} className="min-w-40 gap-2">
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? 'Importing...' : 'Import private key'}
      </Button>
    </div>
  )
}

export default ImportPrivateKey
