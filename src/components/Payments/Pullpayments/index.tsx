import { useState } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader, PageShell } from '@/components/Layout/PageHeader'

import { CURRENCY, PULL_PAYMENT_STATUS } from '@/packages/constants'
import axios from '@/utils/http/axios'
import { getApiErrorMessage } from '@/utils/http/api-error'
import { Http } from '@/utils/http/http'
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store'
import PullPaymentDataGrid from '@/components/DataList/PullPaymentDataGrid'
import { useShallow } from 'zustand/react/shallow'

const Pullpayments = () => {
  const [openCreatePullPayment, setOpenCreatePullPayment] = useState<boolean>(false)

  const [name, setName] = useState<string>('')
  const [amount, setAmount] = useState<number>(0)
  const [currency, setCurrency] = useState<string>(CURRENCY[0])
  const [showAutoApproveClaim, setShowAutoApproveClaim] = useState<boolean>(true)
  const [description, setDescription] = useState<string>('')
  const [showNameAlert, setShowNameAlert] = useState<boolean>(false)
  const [showAmountAlert, setShowAmountAlert] = useState<boolean>(false)

  const { userId, network } = useUserPresistStore(
    useShallow((state) => ({
      userId: state.userId,
      network: state.network,
    }))
  )

  const { storeId } = useStorePresistStore(
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

  const tabList = [
    { key: 'active', label: PULL_PAYMENT_STATUS.Active, status: PULL_PAYMENT_STATUS.Active },
    { key: 'expired', label: PULL_PAYMENT_STATUS.Expired, status: PULL_PAYMENT_STATUS.Expired },
    { key: 'settled', label: PULL_PAYMENT_STATUS.Settled, status: PULL_PAYMENT_STATUS.Settled },
    { key: 'archived', label: PULL_PAYMENT_STATUS.Archived, status: PULL_PAYMENT_STATUS.Archived },
    { key: 'future', label: PULL_PAYMENT_STATUS.Future, status: PULL_PAYMENT_STATUS.Future },
  ]

  const clearData = () => {
    setName('')
    setAmount(0)
    setCurrency(CURRENCY[0])
    setShowAutoApproveClaim(false)
    setDescription('')
    setShowNameAlert(false)
    setShowAmountAlert(false)
  }

  const checkName = (): boolean => {
    if (name && name.trim() !== '') {
      setShowNameAlert(false)
      return true
    }
    setShowNameAlert(true)
    return false
  }

  const checkAmount = (): boolean => {
    if (amount && amount > 0) {
      setShowAmountAlert(false)
      return true
    }
    setShowAmountAlert(true)
    return false
  }

  const onClickCreate = async () => {
    try {
      if (!CURRENCY.includes(currency)) {
        setSnackSeverity('error')
        setSnackMessage('Please select a valid currency')
        setSnackOpen(true)
        return
      }

      if (!checkName()) {
        return
      }

      if (!checkAmount()) {
        return
      }

      const response: any = await axios.post(Http.create_pull_payment, {
        user_id: userId,
        store_id: storeId,
        network: network === 'mainnet' ? 1 : 2,
        name: name,
        amount: amount,
        currency: currency,
        show_auto_approve_claim: showAutoApproveClaim ? 1 : 2,
        description: description,
      })

      if (response.result) {
        setSnackSeverity('success')
        setSnackMessage('Successful create!')
        setSnackOpen(true)

        clearData()
        setOpenCreatePullPayment(false)
      } else {
        setSnackSeverity('error')
        setSnackMessage('Something went wrong. Please try again.')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage(getApiErrorMessage(e))
      setSnackOpen(true)
      console.error(e)
    }
  }

  return (
    <PageShell>
      {openCreatePullPayment ? (
        <div className="space-y-6">
          <PageHeader
            title="Create Pull Payment"
            description="Let receivers claim funds from your wallet after approval."
            actions={
              <>
                <Button variant="outline" onClick={() => setOpenCreatePullPayment(false)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={onClickCreate}>Create</Button>
              </>
            }
          />

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Pull Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2 max-w-md">
                <Label className="flex items-center gap-0.5">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (showNameAlert && e.target.value) setShowNameAlert(false)
                  }}
                  placeholder="Enter payment name"
                />
                {showNameAlert && (
                  <p className="text-xs text-destructive font-medium mt-1">
                    The Name field is required.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
                <div className="space-y-2">
                  <Label className="flex items-center gap-0.5">
                    Amount <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(Number(e.target.value))
                      if (showAmountAlert && Number(e.target.value) > 0) setShowAmountAlert(false)
                    }}
                    placeholder="0.00"
                  />
                  {showAmountAlert && (
                    <p className="text-xs text-destructive font-medium mt-1">
                      Please provide an amount greater than 0
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-0.5">
                    Currency <span className="text-destructive">*</span>
                  </Label>
                  <Select value={currency} onValueChange={(val) => setCurrency(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY &&
                        CURRENCY.length > 0 &&
                        CURRENCY.map((item, index) => (
                          <SelectItem key={index} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="auto-approve"
                  checked={showAutoApproveClaim}
                  onCheckedChange={(checked) => setShowAutoApproveClaim(!!checked)}
                />
                <Label htmlFor="auto-approve" className="cursor-pointer font-normal text-sm">
                  Automatically approve claims
                </Label>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the purpose of this pull payment..."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <PageHeader
            title="Pull Payments"
            description="Receivers claim funds from your wallet; approved claims are released as payouts."
            actions={
              <Button onClick={() => setOpenCreatePullPayment(true)} className="gap-1.5">
                <Plus className="h-4 w-4" />
                Create Pull Payment
              </Button>
            }
          />

          <Tabs defaultValue={tabList[0].key} className="w-full space-y-4">
            <div className="overflow-x-auto pb-1">
              <TabsList className="inline-flex h-10 w-full items-center justify-start rounded-md bg-muted p-1 text-muted-foreground sm:w-auto">
                {tabList.map((tab) => (
                  <TabsTrigger
                    key={tab.key}
                    value={tab.key}
                    className="whitespace-nowrap px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {tabList.map((tab) => (
              <TabsContent key={tab.key} value={tab.key} className="focus-visible:outline-none">
                <PullPaymentDataGrid status={tab.status} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </PageShell>
  )
}

export default Pullpayments
