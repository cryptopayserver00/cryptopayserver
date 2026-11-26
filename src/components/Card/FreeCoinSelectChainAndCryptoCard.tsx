import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Search } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { BLOCKCHAIN, BLOCKCHAINNAMES, COIN } from '@/packages/constants/blockchain'
import CreateFreeFundsDialog from '@/components/Dialog/CreateFreeFundsDialog'

interface SelectType {
  network: number
  amount: number
  currency: string
  onClickCoin: (item: COIN, address: string, amount: number) => Promise<void>
}

export default function FreeCoinSelectChainAndCryptoCard(props: SelectType) {
  const [blockchains, setBlockchains] = useState<BLOCKCHAIN[]>([])
  const [selectCoinItem, setSelectCoinItem] = useState<COIN>()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const value = BLOCKCHAINNAMES.filter((item: any) =>
      props.network === 1 ? item.isMainnet : !item.isMainnet
    )
    setBlockchains(value)
  }, [props.network])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return blockchains

    return blockchains
      .map((chain) => {
        const coins = (chain.coins || []).filter(
          (coin) =>
            coin.name.toLowerCase().includes(q) ||
            chain.name.toLowerCase().includes(q) ||
            (chain.desc || '').toLowerCase().includes(q)
        )
        return { ...chain, coins }
      })
      .filter((chain) => chain.coins.length > 0)
  }, [blockchains, query])

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search chain or coin…"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          No chains match “{query}”.
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full space-y-2">
          {filtered.map((item) => (
            <AccordionItem
              key={item.name}
              value={item.name}
              className="overflow-hidden rounded-lg border bg-card px-4"
            >
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold tracking-wide">{item.name}</span>
                      <Badge variant="secondary" className="font-normal">
                        {item.coins?.length || 0}
                      </Badge>
                    </div>
                    {item.desc ? (
                      <p className="mt-0.5 truncate text-sm font-normal text-muted-foreground">
                        {item.desc}
                      </p>
                    ) : null}
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent>
                <div className="grid gap-1 pb-2 sm:grid-cols-2">
                  {item.coins?.map((coinItem: COIN) => (
                    <button
                      key={`${item.name}-${coinItem.name}`}
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
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded-full"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{coinItem.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {coinItem.isMainCoin ? 'Native' : 'Token'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

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
