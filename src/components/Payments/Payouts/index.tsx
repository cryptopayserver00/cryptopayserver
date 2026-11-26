import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader, PageShell } from '@/components/Layout/PageHeader'

import PayoutDataGrid from '../../DataList/PayoutDataGrid'
import { PAYOUT_STATUS } from '@/packages/constants'

const Payouts = () => {
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
    <PageShell>
      <PageHeader
        title="Payouts"
        description="Process pull-payment claims as refunds, salaries, or withdrawals."
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
            <PayoutDataGrid status={tab.status} />
          </TabsContent>
        ))}
      </Tabs>
    </PageShell>
  )
}

export default Payouts
