import { useState } from 'react'
import { Info } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import PayoutDataGrid from '../../DataList/PayoutDataGrid'
import { PAYOUT_STATUS } from '@/packages/constants'

const Payouts = () => {
  const [openExplain, setOpenExplain] = useState<boolean>(false)

  const tabList = [
    {
      key: 'awaitingApproval',
      label: PAYOUT_STATUS.AwaitingApproval,
      status: PAYOUT_STATUS.AwaitingApproval,
    },
    {
      key: 'awaitingPayment',
      label: PAYOUT_STATUS.AwaitingPayment,
      status: PAYOUT_STATUS.AwaitingPayment,
    },
    { key: 'inProgress', label: PAYOUT_STATUS.InProgress, status: PAYOUT_STATUS.InProgress },
    { key: 'completed', label: PAYOUT_STATUS.Completed, status: PAYOUT_STATUS.Completed },
    { key: 'cancelled', label: PAYOUT_STATUS.Cancelled, status: PAYOUT_STATUS.Cancelled },
  ]

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 space-y-6">
      <div className="flex items-center gap-2 pb-2 border-b">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Payouts</h1>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => setOpenExplain(!openExplain)}
        >
          <Info className="h-4 w-4" />
        </Button>
      </div>

      {openExplain && (
        <Alert className="bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-800 dark:text-blue-300">Info</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-400 text-sm mt-1 leading-relaxed">
            Payouts allow you to process pull payments, in the form of refunds, salary payouts, or
            withdrawals.
            <br />
            You can also configure payout processors to automate payouts.
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
          <TabsContent key={tab.key} value={tab.key} className="pt-2 focus-visible:outline-none">
            <PayoutDataGrid status={tab.status} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

export default Payouts
