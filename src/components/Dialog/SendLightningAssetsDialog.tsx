import { useEffect, useState } from 'react'
import { Zap, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useSnackPresistStore } from '@/lib/store'
import lightningPayReq, { PaymentRequestObject } from 'bolt11'
import { SatoshisToBtc } from '@/utils/number'
import { useShallow } from 'zustand/react/shallow'

type DialogType = {
  openDialog: boolean
  setOpenDialog: (value: boolean) => void
  onClickSendLightningAssets: (value: string) => Promise<void>
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="text-sm font-medium text-muted-foreground shrink-0 min-w-[110px]">
        {label}
      </span>
      <span className="text-sm text-right break-all">{value ?? 'None'}</span>
    </div>
  )
}

export default function SendLightningAssetsDialog(props: DialogType) {
  const [invoice, setInvoice] = useState('')
  const [decodeInfo, setDecodeInfo] = useState<PaymentRequestObject>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      setSnackSeverity: state.setSnackSeverity,
      setSnackMessage: state.setSnackMessage,
      setSnackOpen: state.setSnackOpen,
    }))
  )

  const handleDialogClose = () => {
    setInvoice('')
    setDecodeInfo(undefined)
    props.setOpenDialog(false)
  }

  useEffect(() => {
    try {
      if (!invoice || invoice === '') {
        setDecodeInfo(undefined)
        return
      }

      const decodeInvoice = lightningPayReq.decode(invoice)
      setDecodeInfo(decodeInvoice)
    } catch (e) {
      console.error(e)
      setDecodeInfo(undefined)
      setSnackSeverity('error')
      setSnackMessage('Parsing error, please try again')
      setSnackOpen(true)
    }
  }, [invoice])

  const paymentHash =
    decodeInfo?.tags.find((item) => item.tagName === 'payment_hash')?.data.toString() || 'None'

  const description =
    decodeInfo?.tags.find((item) => item.tagName === 'description')?.data.toString() || 'None'

  return (
    <Dialog open={props.openDialog} onOpenChange={(v) => !v && handleDialogClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Send Lightning Network Assets
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <Alert className="border-amber-500/50 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Note</AlertTitle>
            <AlertDescription>Limit exceeded. Please configure your wallet.</AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="invoice">Request String</Label>
            <Textarea
              id="invoice"
              value={invoice}
              onChange={(e) => setInvoice(e.target.value)}
              placeholder="Enter request string"
              rows={4}
              className="font-mono text-xs"
            />
          </div>

          {decodeInfo && (
            <div className="space-y-2">
              <Label>Payment Info</Label>
              <div className="rounded-lg border p-4 space-y-0.5">
                <DetailRow
                  label="Network"
                  value={
                    decodeInfo.network?.bech32 === 'bc' ? 'bitcoin mainnet' : 'bitcoin testnet'
                  }
                />
                <DetailRow
                  label="Amount"
                  value={`${SatoshisToBtc(Number(decodeInfo.satoshis)).toFixed(8)} BTC`}
                />
                <DetailRow
                  label="Date"
                  value={new Date(Number(decodeInfo.timestamp) * 1000).toLocaleString()}
                />
                <Separator className="my-2" />
                <DetailRow label="Payment Hash" value={paymentHash} />
                <DetailRow label="Description" value={description} />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleDialogClose}>
            Close
          </Button>
          <Button
            disabled={!decodeInfo || isSubmitting}
            onClick={async () => {
              try {
                setIsSubmitting(true)
                await props.onClickSendLightningAssets(invoice)
                handleDialogClose()
              } finally {
                setIsSubmitting(false)
              }
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
