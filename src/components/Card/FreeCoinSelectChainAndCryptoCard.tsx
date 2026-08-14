import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BLOCKCHAIN, BLOCKCHAINNAMES, COIN } from '@/packages/constants/blockchain'
import CreateFreeFundsDialog from '@/components/Dialog/CreateFreeFundsDialog'

type SelectType = {
  network: number
  amount: number
  currency: string
  onClickCoin: (item: COIN, address: string, amount: number) => Promise<void>
}

export default function FreeCoinSelectChainAndCryptoCard(props: SelectType) {
  const [blockchains, setBlockchains] = useState<BLOCKCHAIN[]>([])
  const [selectCoinItem, setSelectCoinItem] = useState<COIN>()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const value = BLOCKCHAINNAMES.filter((item: any) =>
      props.network === 1 ? item.isMainnet : !item.isMainnet
    )
    setBlockchains(value)
  }, [props.network])

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
                    onClick={() => {
                      setSelectCoinItem(coinItem)
                      setOpen(true)
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

      <CreateFreeFundsDialog
        network={props.network}
        selectCoinItem={selectCoinItem as COIN}
        openDialog={open}
        setOpenDialog={setOpen}
        onClickCoin={props.onClickCoin}
      />
    </div>
  )
}
