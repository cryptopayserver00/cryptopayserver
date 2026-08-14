import { useState } from 'react'
import Image from 'next/image'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { CURRENCY_SYMBOLS } from '@/packages/constants'
import { CHAINS, COIN } from '@/packages/constants/blockchain'
import { FindChainNamesByChains } from '@/utils/web3'

type DialogType = {
  selectCoinItem: COIN
  currency: string
  amount: number
  cryptoAmount: string
  rate: number
  openDialog: boolean
  setOpenDialog: (value: boolean) => void
  handleClose: () => void
  onClickCoin: (item: COIN, cryptoAmount: string, rate: number) => Promise<void>
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value ?? '—'}</span>
    </div>
  )
}

export default function CreateInvoiceDialog(props: DialogType) {
  const [isCreating, setIsCreating] = useState(false)

  const chainName = FindChainNamesByChains(props.selectCoinItem?.chainId as CHAINS)

  return (
    <Dialog open={props.openDialog} onOpenChange={(v) => !v && props.handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create Invoice
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {props.selectCoinItem?.icon && (
            <div className="flex items-center gap-3">
              <Image
                src={props.selectCoinItem.icon}
                alt={props.selectCoinItem.name ?? 'coin'}
                width={48}
                height={48}
                className="rounded-full"
              />
              <div>
                <p className="font-medium">{props.selectCoinItem.name}</p>
                <p className="text-sm text-muted-foreground">{chainName}</p>
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-0.5">
            <DetailRow label="Select Chain" value={chainName} />
            <DetailRow label="Select Coin" value={props.selectCoinItem?.name} />
            <DetailRow
              label="Crypto Rate"
              value={`1 ${props.selectCoinItem?.name} = ${
                CURRENCY_SYMBOLS[props.currency]
              }${props.rate}`}
            />
            <Separator className="my-2" />
            <DetailRow
              label="You Will Pay"
              value={`${props.cryptoAmount} ${props.selectCoinItem?.name}`}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={props.handleClose}>
            Close
          </Button>
          <Button
            disabled={isCreating || !props.selectCoinItem}
            onClick={async () => {
              if (!props.selectCoinItem) return
              try {
                setIsCreating(true)
                await props.onClickCoin(props.selectCoinItem, props.cryptoAmount, props.rate)
                props.handleClose()
              } finally {
                setIsCreating(false)
              }
            }}
          >
            {isCreating ? 'Creating...' : 'Create Invoice'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
