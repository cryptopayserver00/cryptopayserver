import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AccessToken from './AccessToken'
import Checkout from './Checkout'
import Emails from './Email'
import Forms from './Forms'
import General from './General'
import Payout from './Payout'
import Rates from './Rates'
import Roles from './Roles'
import Users from './Users'
import Webhooks from './Webhooks'

import { SETTING_TAB_DATAS } from '@/packages/constants'

const Settings = () => {
  const router = useRouter()
  const { tab } = router.query

  const [value, setValue] = useState<number>(0)

  const handleTabChange = (valStr: string) => {
    const newValue = Number(valStr)
    const tabId = Object.values(SETTING_TAB_DATAS).find((item) => item.id === newValue)?.tabId

    router.replace({
      pathname: router.pathname,
      query: { ...router.query, tab: tabId },
    })

    setValue(newValue)
  }

  const init = (currentTab: any) => {
    const tabId = Object.values(SETTING_TAB_DATAS).find((item) => item.tabId === currentTab)?.id
    setValue(tabId || 0)
  }

  useEffect(() => {
    if (tab) {
      init(tab)
    }
  }, [tab])

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6">Store Settings</h2>

      <Tabs value={String(value)} onValueChange={handleTabChange} className="w-full space-y-6">
        <div className="border-b border-border overflow-x-auto scrollbar-none">
          <TabsList className="h-auto p-0 bg-transparent justify-start gap-2 border-b-0 rounded-none inline-flex min-w-full">
            {SETTING_TAB_DATAS &&
              SETTING_TAB_DATAS.length > 0 &&
              SETTING_TAB_DATAS.map((item) => (
                <TabsTrigger
                  key={item.id}
                  value={String(item.id)}
                  className="px-4 py-2.5 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:text-foreground transition-colors whitespace-nowrap"
                >
                  {item.title}
                </TabsTrigger>
              ))}
          </TabsList>
        </div>

        <div className="pt-2">
          <TabsContent value="0" className="mt-0 focus-visible:outline-none">
            <General />
          </TabsContent>
          <TabsContent value="1" className="mt-0 focus-visible:outline-none">
            <Rates />
          </TabsContent>
          <TabsContent value="2" className="mt-0 focus-visible:outline-none">
            <Checkout />
          </TabsContent>
          <TabsContent value="3" className="mt-0 focus-visible:outline-none">
            <AccessToken />
          </TabsContent>
          <TabsContent value="4" className="mt-0 focus-visible:outline-none">
            <Users />
          </TabsContent>
          <TabsContent value="5" className="mt-0 focus-visible:outline-none">
            <Roles />
          </TabsContent>
          <TabsContent value="6" className="mt-0 focus-visible:outline-none">
            <Webhooks />
          </TabsContent>
          <TabsContent value="7" className="mt-0 focus-visible:outline-none">
            <Payout />
          </TabsContent>
          <TabsContent value="8" className="mt-0 focus-visible:outline-none">
            <Emails />
          </TabsContent>
          <TabsContent value="9" className="mt-0 focus-visible:outline-none">
            <Forms />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

export default Settings
