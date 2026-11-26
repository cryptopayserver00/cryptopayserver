import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { ArrowLeft, Check, Copy, Wallet } from 'lucide-react'
import axios from '@/utils/http/axios'
import { getApiErrorMessage } from '@/utils/http/api-error'
import { Http } from '@/utils/http/http'
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store'
import { GetImgSrcByChain, GetImgSrcByCrypto } from '@/utils/qrcode'
import TransactionDataGrid from '@/components/DataList/TransactionDataGrid'
import { FindChainNamesByChains, FindChainPathNamesByChains } from '@/utils/web3'
import { CHAINS, COIN, COINS } from '@/packages/constants/blockchain'
import WalletConnectButton from '@/components/Button/WalletConnectButton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OmitMiddleString } from '@/utils/strings'
import { cn } from '@/lib/utils'
import { useShallow } from 'zustand/react/shallow'

const WalletsReceive = () => {
  const router = useRouter()
  const { chainId: chainIdQuery, storeId: storeIdQuery, network: networkQuery } = router.query
  const [address, setAddress] = useState<string>('')
  const [mainCoin, setMainCoin] = useState<COIN>()
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showFullAddress, setShowFullAddress] = useState(false)

  const { network: storeNetwork } = useUserPresistStore(
    useShallow((state) => ({
      network: state.network,
    }))
  )

  const { storeId: persistedStoreId } = useStorePresistStore(
    useShallow((state) => ({
      storeId: state.storeId,
    }))
  )

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      setSnackSeverity: state.setSnackSeverity,
      setSnackMessage: state.setSnackMessage,
      setSnackOpen: state.setSnackOpen,
    }))
  )

  const chainId = Number(chainIdQuery)
  const storeId = Number(storeIdQuery || persistedStoreId)
  const network = String(networkQuery || storeNetwork || '')
  const chainName = chainId ? FindChainNamesByChains(chainId as CHAINS) : ''
  const backHref = chainId ? `/wallets/${FindChainPathNamesByChains(chainId as CHAINS)}` : '/wallets'

  const getWallet = async (chainIdValue: number, storeIdValue: number, networkValue: string) => {
    try {
      setLoading(true)
      const response: any = await axios.get(Http.find_asset_balance, {
        params: {
          chain_id: chainIdValue,
          store_id: storeIdValue,
          network: networkValue === 'mainnet' ? 1 : 2,
        },
      })

      if (response.result) {
        setAddress(response.data.address)
        setMainCoin(response.data.mainCoin)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage(getApiErrorMessage(e))
      setSnackOpen(true)
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!chainId || !storeId || !network) {
      return
    }
    getWallet(chainId, storeId, network)
  }, [chainId, storeId, network])

  const copyAddress = async () => {
    if (!address) return
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setSnackMessage('Address copied')
    setSnackSeverity('success')
    setSnackOpen(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="mx-auto max-w-screen-md px-4 py-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" className="gap-1.5 -ml-2" asChild>
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <Badge variant="outline" className="font-normal capitalize">
          {network || '—'}
        </Badge>
      </div>

      <div className="mb-8 flex flex-col items-center text-center">
        {GetImgSrcByChain(chainId) ? (
          <Image
            src={GetImgSrcByChain(chainId)}
            alt={chainName}
            width={48}
            height={48}
            className="h-12 w-12"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Wallet className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          Receive {mainCoin?.name || chainName}
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Only send {chainName} assets to this address. Funds sent on another network may be lost.
        </p>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">Deposit address</CardTitle>
            <WalletConnectButton
              network={network === 'mainnet' ? 1 : 2}
              chainId={Number(chainId)}
              address={address}
              value="0"
            />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 py-8">
          {address && !loading ? (
            <div className="rounded-2xl border bg-background p-4 shadow-sm">
              <QRCodeSVG
                value={address}
                width={220}
                height={220}
                imageSettings={{
                  src: GetImgSrcByCrypto(mainCoin?.name as COINS),
                  width: 28,
                  height: 28,
                  excavate: true,
                }}
              />
            </div>
          ) : (
            <div className="flex h-[220px] w-[220px] items-center justify-center rounded-2xl border bg-muted/40 text-sm text-muted-foreground">
              {loading ? 'Loading address…' : 'No address yet'}
            </div>
          )}

          <div className="w-full max-w-lg space-y-3">
            <button
              type="button"
              className="w-full break-all rounded-xl border bg-muted/30 px-4 py-3 text-left font-mono text-sm transition-colors hover:bg-muted/50"
              onClick={() => setShowFullAddress((v) => !v)}
              disabled={!address}
            >
              {address
                ? showFullAddress
                  ? address
                  : OmitMiddleString(address, 12)
                : '—'}
            </button>

            <div className="flex flex-wrap gap-2">
              <Button className="flex-1 gap-1.5" onClick={copyAddress} disabled={!address}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy address'}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                disabled={!address}
                onClick={() => setShowFullAddress((v) => !v)}
              >
                {showFullAddress ? 'Hide full address' : 'Show full address'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-10 space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Latest transactions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Recent on-chain activity for this receive address
          </p>
        </div>
        {chainId && storeId && network ? (
          <TransactionDataGrid
            source="none"
            chain={Number(chainId)}
            storeId={Number(storeId)}
            network={String(network)}
            address={address}
          />
        ) : (
          <p
            className={cn(
              'rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground'
            )}
          >
            Missing wallet context. Open Receive from a chain wallet page.
          </p>
        )}
      </div>
    </div>
  )
}

export default WalletsReceive
