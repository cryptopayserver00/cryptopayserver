import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { useSnackPresistStore } from '@/lib/store'
import { COINGECKO_IDS } from '@/packages/constants'
import { BLOCKCHAIN, BLOCKCHAINNAMES, COIN } from '@/packages/constants/blockchain'
import { BigDiv } from '@/utils/number'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import CreateInvoiceDialog from '@/components/Dialog/CreateInvoiceDialog'
import { useShallow } from 'zustand/react/shallow'

type SelectType = {
  storeId: number
  network: number
  amount: number
  currency: string
  onClickCoin: (item: COIN, cryptoAmount: string, rate: number) => Promise<void>
}

export default function PaymentRequestSelectChainAndCryptoCard(props: SelectType) {
  const [blockchains, setBlockchains] = useState<BLOCKCHAIN[]>([])
  const [selectCoinItem, setSelectCoinItem] = useState<COIN>()
  const [openDialog, setOpenDialog] = useState(false)
  const [rate, setRate] = useState(0)
  const [cryptoAmount, setCryptoAmount] = useState('')

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      setSnackSeverity: state.setSnackSeverity,
      setSnackMessage: state.setSnackMessage,
      setSnackOpen: state.setSnackOpen,
    }))
  )

  const getBlockchain = async (storeId: number, network: number) => {
    try {
      const response: any = await axios.get(Http.find_wallet_coin_enables, {
        params: {
          store_id: storeId,
          network: network,
        },
      })

      if (response.result) {
        const respCoins = response.data

        const chains = BLOCKCHAINNAMES.filter((item: any) =>
          props.network === 1 ? item.isMainnet : !item.isMainnet
        )

        const newBlockchains: BLOCKCHAIN[] = []

        for (const item of chains) {
          const newItem: BLOCKCHAIN = { ...item, coins: [...item.coins] }

          if (respCoins && respCoins.length > 0) {
            newItem.coins = newItem.coins.filter((coin: COIN) => {
              const matchingCoin = respCoins.find(
                (respCoin: any) => respCoin.chainId === coin.chainId && respCoin.name === coin.name
              )
              return !matchingCoin || matchingCoin.enabled !== 2
            })

            if (newItem.coins.length > 0) {
              newBlockchains.push(newItem)
            }
          } else {
            newBlockchains.push(newItem)
          }
        }

        setBlockchains(newBlockchains)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  useEffect(() => {
    getBlockchain(props.storeId, props.network)
  }, [props.storeId, props.network])

  const handleClose = () => {
    setRate(0)
    setCryptoAmount('')
    setSelectCoinItem(undefined)
    setOpenDialog(false)
  }

  const updateRate = async (selectName: COIN, currency: string, amount: number) => {
    try {
      if (!selectName || !currency || !amount) return

      const ids = COINGECKO_IDS[selectName.name]
      const response: any = await axios.get(Http.find_crypto_price, {
        params: {
          ids: ids,
          currency: currency,
        },
      })

      if (response.result) {
        const rate = response.data[ids][currency.toLowerCase()]
        setRate(rate)
        const totalPrice = parseFloat(BigDiv(amount.toString(), rate)).toFixed(selectName.decimals)
        setCryptoAmount(totalPrice)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-center text-lg">Select Chain and Crypto</CardTitle>
        </CardHeader>
      </Card>

      <Accordion type="single" collapsible className="w-full space-y-2">
        {blockchains?.map((item) => (
          <AccordionItem key={item.name} value={item.name} className="rounded-lg border px-4">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-4 text-left">
                <span className="font-semibold uppercase tracking-wide min-w-[100px]">
                  {item.name}
                </span>
                <span className="text-sm text-muted-foreground font-normal">{item.desc}</span>
              </div>
            </AccordionTrigger>

            <AccordionContent>
              <div className="grid gap-1 pb-2">
                {item.coins?.map((coinItem: COIN) => (
                  <button
                    key={coinItem.name}
                    type="button"
                    onClick={async () => {
                      setSelectCoinItem(coinItem)
                      await updateRate(coinItem, props.currency, props.amount)
                      setOpenDialog(true)
                    }}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-muted"
                  >
                    <Image
                      src={coinItem.icon}
                      alt={coinItem.name}
                      width={40}
                      height={40}
                      className="rounded-full h-10 w-10"
                    />
                    <span className="text-sm font-medium">{coinItem.name}</span>
                  </button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <CreateInvoiceDialog
        selectCoinItem={selectCoinItem as COIN}
        currency={props.currency}
        amount={props.amount}
        cryptoAmount={cryptoAmount}
        rate={rate}
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        handleClose={handleClose}
        onClickCoin={props.onClickCoin}
      />
    </div>
  )
}
