import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader, PageShell } from '@/components/Layout/PageHeader'

import TransactionDataGrid from '../../DataList/TransactionDataGrid'
import { CHAINNAMES } from '@/packages/constants/blockchain'
import { FindChainIdsByChainNames } from '@/utils/web3'
import { useUserPresistStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'

const PaymentTransactions = () => {
  const ALL_CHAINS = 'All Chains' as const

  const [address, setAddress] = useState<string>('')
  const [txChain, setTxChain] = useState<CHAINNAMES | typeof ALL_CHAINS>(ALL_CHAINS)

  const { network } = useUserPresistStore(
    useShallow((state) => ({
      network: state.network,
    }))
  )

  return (
    <PageShell>
      <PageHeader
        title="Transactions"
        description="On-chain activity for addresses used by your store, pulled from explorer APIs."
      />

      <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 sm:flex-row">
        <div className="relative max-w-lg flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search address…"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-56">
          <Select
            value={txChain}
            onValueChange={(val) => setTxChain((val as CHAINNAMES) || ALL_CHAINS)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CHAINS}>All Chains</SelectItem>
              {CHAINNAMES &&
                Object.entries(CHAINNAMES).map(([key, value]) => (
                  <SelectItem key={key} value={value}>
                    {value}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <TransactionDataGrid
        source="none"
        chain={txChain === ALL_CHAINS ? undefined : FindChainIdsByChainNames(txChain)}
        network={network}
        address={address}
      />
    </PageShell>
  )
}

export default PaymentTransactions
