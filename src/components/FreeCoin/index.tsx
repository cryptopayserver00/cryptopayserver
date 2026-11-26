import { useState } from 'react'
import { CheckCircle2, ExternalLink, Gift, RotateCcw } from 'lucide-react'
import Link from 'next/link'

import { COIN } from '@/packages/constants/blockchain'
import { GetBlockchainTxUrlByChainIds } from '@/utils/web3'
import axios from '@/utils/http/axios'
import { getApiErrorMessage } from '@/utils/http/api-error'
import { Http } from '@/utils/http/http'
import { useSnackPresistStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import FreeCoinSelectChainAndCryptoCard from '@/components/Card/FreeCoinSelectChainAndCryptoCard'
import { PageHeader, PageShell } from '@/components/Layout/PageHeader'
import { useShallow } from 'zustand/react/shallow'

const FreeCoin = () => {
  const [page, setPage] = useState<number>(1)
  const [blockExplorerLink, setBlockExplorerLink] = useState<string>('')
  const [claimedCoin, setClaimedCoin] = useState<string>('')

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

  const onClickCoin = async (item: COIN, address: string, amount: number) => {
    if (!item || !address || !amount) {
      showSnack('error', 'Missing or invalid parameters')
      return
    }

    try {
      const checkout_resp: any = await axios.get(Http.checkout_chain_address, {
        params: {
          chain_id: item.chainId,
          address: address,
          network: 2,
        },
      })

      if (!checkout_resp.result) {
        showSnack('error', 'The address is invalid. Please try again.')
        return
      }

      const response: any = await axios.post(Http.get_free_coin, {
        amount: amount,
        chain_id: item.chainId,
        coin: item.name,
        address: address,
        network: 2,
      })

      if (response.result && response.data && response.data.hash) {
        setBlockExplorerLink(GetBlockchainTxUrlByChainIds(false, item.chainId, response.data.hash))
        setClaimedCoin(item.name)
        setPage(2)
      } else {
        showSnack('error', response.message || 'Could not claim test coins. Try again.')
      }
    } catch (e) {
      showSnack('error', getApiErrorMessage(e))
      console.error(e)
    }
  }

  return (
    <PageShell>
      <PageHeader
        title="Get Testnet Coins"
        description="Claim faucet funds for testing. Each request is capped at about $100 USD equivalent (stablecoins ≈ face value)."
      />

      {page === 1 ? (
        <FreeCoinSelectChainAndCryptoCard
          network={2}
          amount={0}
          currency={''}
          onClickCoin={onClickCoin}
        />
      ) : (
        <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-xl border bg-card px-6 py-12 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
            <CheckCircle2 className="h-9 w-9" strokeWidth={1.5} />
          </div>

          <p className="mt-5 text-xl font-semibold tracking-tight">Claim submitted</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {claimedCoin ? `${claimedCoin} ` : ''}was sent to your address. Confirmations may take a
            moment on testnet.
          </p>

          {blockExplorerLink ? (
            <Link
              href={blockExplorerLink}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              View on block explorer
            </Link>
          ) : null}

          <div className="mt-10 flex w-full flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1 gap-1.5"
              onClick={() => {
                setPage(1)
                setBlockExplorerLink('')
                setClaimedCoin('')
              }}
            >
              <RotateCcw className="h-4 w-4" />
              Claim another
            </Button>
            <Button asChild className="flex-1 gap-1.5">
              <Link href="/dashboard">
                <Gift className="h-4 w-4" />
                Back to dashboard
              </Link>
            </Button>
          </div>
        </div>
      )}
    </PageShell>
  )
}

export default FreeCoin
