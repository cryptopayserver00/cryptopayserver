import { useState } from 'react'
import { Info, ArrowLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { CURRENCY, PULL_PAYMENT_STATUS } from '@/packages/constants'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store'
import PullPaymentDataGrid from '@/components/DataList/PullPaymentDataGrid'
import { useShallow } from 'zustand/react/shallow'

const Pullpayments = () => {
  const [openExplain, setOpenExplain] = useState<boolean>(false)
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
        setSnackMessage('Incorrect currency')
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
        setSnackMessage('Something wrong, please try it again')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 space-y-6">
      {openCreatePullPayment ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Create Pull Payment
            </h1>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setOpenCreatePullPayment(false)
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={onClickCreate}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Create
              </Button>
            </div>
          </div>

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
          <div className="flex items-center justify-between pb-2 border-b">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Pull Payments</h1>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setOpenExplain(!openExplain)}
              >
                <Info className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={() => setOpenCreatePullPayment(true)} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Create Pull Payment
            </Button>
          </div>

          {openExplain && (
            <Alert className="bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-800 dark:text-blue-300">Info</AlertTitle>
              <AlertDescription className="text-blue-700 dark:text-blue-400 text-sm mt-1 leading-relaxed">
                Pull Payments allow receivers to claim specified funds from your wallet at their
                convenience.
                <br />
                Once submitted and approved, the funds will be released.
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue={tabList[0].key} className="w-full space-y-4">
            <div className="overflow-x-auto pb-1">
              <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-full sm:w-auto">
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
              <TabsContent
                key={tab.key}
                value={tab.key}
                className="pt-2 focus-visible:outline-none"
              >
                <PullPaymentDataGrid status={tab.status} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  )
}

export default Pullpayments
