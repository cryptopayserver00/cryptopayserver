import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, Check, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useSnackPresistStore } from '@/lib/store'
import { OmitMiddleString } from '@/utils/strings'
import { useShallow } from 'zustand/react/shallow'

type DialogType = {
  openDialog: boolean
  setOpenDialog: (value: boolean) => void
  websiteUrl: string
}

export default function PullPaymentQRDialog(props: DialogType) {
  const [copied, setCopied] = useState(false)

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      setSnackSeverity: state.setSnackSeverity,
      setSnackMessage: state.setSnackMessage,
      setSnackOpen: state.setSnackOpen,
    }))
  )

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(props.websiteUrl)
      setCopied(true)
      setSnackMessage('Successfully copy')
      setSnackSeverity('success')
      setSnackOpen(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setSnackSeverity('error')
      setSnackMessage('Failed to copy')
      setSnackOpen(true)
    }
  }

  return (
    <Dialog open={props.openDialog} onOpenChange={(v) => !v && props.setOpenDialog(false)}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Pull Payment QR
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-2">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <QRCodeSVG
              value={props.websiteUrl}
              width={220}
              height={220}
              // imageSettings={{
              //   src: '',
              //   width: 35,
              //   height: 35,
              //   excavate: false,
              // }}
            />
          </div>

          <div className="w-full space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Pull Payment QR
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-md bg-muted px-3 py-2 text-xs font-mono">
                {OmitMiddleString(props.websiteUrl, 20)}
              </code>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 h-9 w-9"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Scan this QR code to open this page on your mobile device.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
