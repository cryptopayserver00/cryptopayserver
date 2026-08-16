import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { QRCodeSVG } from 'qrcode.react'
import { Copy } from 'lucide-react'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { useSnackPresistStore } from '@/lib/store'
import { GetImgSrcByCrypto } from '@/utils/qrcode'
import TransactionDataGrid from '@/components/DataList/TransactionDataGrid'
import { FindChainNamesByChains } from '@/utils/web3'
import { CHAINS, COIN, COINS } from '@/packages/constants/blockchain'
import WalletConnectButton from '@/components/Button/WalletConnectButton'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useShallow } from 'zustand/react/shallow'

const WalletsReceive = () => {
  const router = useRouter()
  const { chainId, storeId, network } = router.query
  const [address, setAddress] = useState<string>('')
  const [mainCoin, setMainCoin] = useState<COIN>()

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      setSnackSeverity: state.setSnackSeverity,
      setSnackMessage: state.setSnackMessage,
      setSnackOpen: state.setSnackOpen,
    }))
  )

  const getWallet = async (chainId: number, storeId: number, network: string) => {
    try {
      const response: any = await axios.get(Http.find_asset_balance, {
        params: {
          chain_id: chainId,
          store_id: storeId,
          network: network === 'mainnet' ? 1 : 2,
        },
      })

      if (response.result) {
        setAddress(response.data.address)
        setMainCoin(response.data.mainCoin)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  useEffect(() => {
    if (!chainId || !storeId || !network) {
      return
    }
    getWallet(Number(chainId), Number(storeId), String(network))
  }, [chainId, storeId, network])

  const copyAddress = async () => {
    await navigator.clipboard.writeText(address)
    setSnackMessage('Successfully copy')
    setSnackSeverity('success')
    setSnackOpen(true)
  }

  return (
    <div className="mt-4">
      <div className="mx-auto max-w-screen-md px-4">
        <h1 className="mt-4 text-center text-3xl font-bold tracking-tight">
          Receive {mainCoin?.name}
        </h1>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground">
            Send only {FindChainNamesByChains(Number(chainId))} assets to this address
          </p>

          <div className="mt-2 flex justify-end">
            <WalletConnectButton
              network={network === 'mainnet' ? 1 : 2}
              chainId={Number(chainId)}
              address={address}
              value="0"
            />
          </div>

          <Card className="mt-5 flex flex-col items-center gap-6 p-10 sm:p-16">
            <QRCodeSVG
              value={address}
              width={250}
              height={250}
              imageSettings={{
                src: GetImgSrcByCrypto(mainCoin?.name as COINS),
                width: 30,
                height: 30,
                excavate: true,
              }}
            />

            <div className="flex items-center gap-2">
              <span className="break-all text-sm">{address}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={copyAddress}
                aria-label="Copy address"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold">Latest Transaction</h2>
          <div className="mt-4">
            {chainId && storeId && network && (
              <TransactionDataGrid
                source="none"
                chain={Number(chainId)}
                storeId={Number(storeId)}
                network={String(network)}
                address={address}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WalletsReceive
