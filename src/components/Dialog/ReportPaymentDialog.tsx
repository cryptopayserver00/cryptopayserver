import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useSnackPresistStore } from '@/lib/store'
import { WALLET } from '@/packages/constants'
import { CHAINNAMES } from '@/packages/constants/blockchain'
import { useShallow } from 'zustand/react/shallow'

type DialogType = {
  openDialog: boolean
  setOpenDialog: (value: boolean) => void
}

export default function ReportPaymentDialog(props: DialogType) {
  const [issueWallet, setIssueWallet] = useState<string>('')
  const [issuePaymentMethod, setIssuePaymentMethod] = useState<string>('')
  const [issueMessage, setIssueMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      setSnackSeverity: state.setSnackSeverity,
      setSnackMessage: state.setSnackMessage,
      setSnackOpen: state.setSnackOpen,
    }))
  )

  const handleDialogClose = () => {
    setIssueWallet('')
    setIssuePaymentMethod('')
    setIssueMessage('')
    props.setOpenDialog(false)
  }

  const onClickSubmitIssue = async () => {
    try {
      setIsSubmitting(true)
      setSnackSeverity('success')
      setSnackMessage('report issue success!')
      setSnackOpen(true)
      handleDialogClose()
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={props.openDialog} onOpenChange={(v) => !v && handleDialogClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Report An Issue
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <p className="text-sm font-medium">I have an issue in making payment</p>

          <div className="space-y-2">
            <Label>Select wallet which you have used</Label>
            <Select value={issueWallet} onValueChange={setIssueWallet}>
              <SelectTrigger>
                <SelectValue placeholder="Select wallet" />
              </SelectTrigger>
              <SelectContent>
                {WALLET?.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Select payment method which you have used</Label>
            <Select value={issuePaymentMethod} onValueChange={setIssuePaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CHAINNAMES).map(([key, value]) => (
                  <SelectItem key={key} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Provide more information like error message, failure etc</Label>
            <Textarea
              value={issueMessage}
              onChange={(e) => setIssueMessage(e.target.value)}
              placeholder="Type a reason..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleDialogClose}>
            Close
          </Button>
          <Button disabled={isSubmitting} onClick={onClickSubmitIssue}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
