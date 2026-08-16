import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store'
import { CHAINS } from '@/packages/constants/blockchain'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { FindChainNamesByChains } from '@/utils/web3'
import { useShallow } from 'zustand/react/shallow'

const Payout = () => {
  const [id, setId] = useState<number>(0)
  const [isConfigure, setIsConfigure] = useState<boolean>(false)
  const [configureChain, setConfigureChain] = useState<CHAINS>(CHAINS.BITCOIN)
  const [showApprovePayoutProcess, setShowApprovePayoutProcess] = useState<boolean>(false)
  const [interval, setInterval] = useState<number>(0)
  const [feeBlockTarget, setFeeBlockTarget] = useState<number>(0)
  const [threshold, setThreshold] = useState<number>(0)

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      setSnackSeverity: state.setSnackSeverity,
      setSnackMessage: state.setSnackMessage,
      setSnackOpen: state.setSnackOpen,
    }))
  )
  const onClickSave = async () => {
    try {
      if (!id) {
        return
      }

      const response: any = await axios.put(Http.update_payout_setting_by_id, {
        id: id,
        show_approve_payout_process: showApprovePayoutProcess ? 1 : 2,
        interval: interval,
        fee_block_target: feeBlockTarget,
        threshold: threshold,
      })

      if (response.result) {
        setSnackSeverity('success')
        setSnackMessage('Update successful!')
        setSnackOpen(true)

        setIsConfigure(false)
      } else {
        setSnackSeverity('error')
        setSnackMessage('Update failed!')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    } finally {
      clearData()
    }
  }

  const clearData = () => {
    setId(0)
    setConfigureChain(CHAINS.BITCOIN)
    setShowApprovePayoutProcess(false)
    setInterval(0)
    setFeeBlockTarget(0)
    setThreshold(0)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {!isConfigure ? (
        <div className="space-y-8">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              Payout Processors
            </h3>
            <p className="text-sm text-muted-foreground">
              Payout Processors allow CryptoPay Server to handle payouts in an automated way.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              Automated Crypto Sender
            </h3>

            <div className="pt-2">
              <StorePayoutTable
                setId={setId}
                setIsConfigure={setIsConfigure}
                setConfigureChain={setConfigureChain}
                setShowApprovePayoutProcess={setShowApprovePayoutProcess}
                setInterval={setInterval}
                setFeeBlockTarget={setFeeBlockTarget}
                setThreshold={setThreshold}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 max-w-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              {FindChainNamesByChains(configureChain)} Payout Processors
            </h3>
            <Button
              variant="outline"
              onClick={() => {
                clearData()
                setIsConfigure(false)
              }}
            >
              Back
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Set a schedule for automated {FindChainNamesByChains(configureChain)} Payouts.
          </p>

          <div className="flex items-center space-x-3 pt-2">
            <Switch
              id="instant-payouts"
              checked={showApprovePayoutProcess}
              onCheckedChange={setShowApprovePayoutProcess}
            />
            <Label htmlFor="instant-payouts" className="cursor-pointer">
              Process approved payouts instantly
            </Label>
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor="interval">Interval*</Label>
            <div className="relative w-64">
              <Input
                id="interval"
                type="number"
                value={interval || ''}
                onChange={(e) => setInterval(Number(e.target.value))}
                className="pr-20"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                minutes
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor="fee-block-target">Fee block target*</Label>
            <div className="relative w-64">
              <Input
                id="fee-block-target"
                type="number"
                value={feeBlockTarget || ''}
                onChange={(e) => setFeeBlockTarget(Number(e.target.value))}
                className="pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                blocks
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor="threshold">Threshold*</Label>
            <div className="relative w-64">
              <Input
                id="threshold"
                type="number"
                value={threshold || ''}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="pr-14"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                USD
              </span>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              Only process payouts when this payout sum is reached.
            </p>
          </div>

          <div className="pt-4">
            <Button
              size="lg"
              onClick={onClickSave}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-8"
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Payout

type TableType = {
  setId: (value: number) => void
  setIsConfigure: (value: boolean) => void
  setConfigureChain: (value: CHAINS) => void
  setShowApprovePayoutProcess: (value: boolean) => void
  setInterval: (value: number) => void
  setFeeBlockTarget: (value: number) => void
  setThreshold: (value: number) => void
}

type RowType = {
  id: number
  pid: number
  chainId: CHAINS
  showApprovePayoutProcess: boolean
  interval: number
  feeBlockTarget: number
  threshold: number
}

function StorePayoutTable(props: TableType) {
  const [rows, setRows] = useState<RowType[]>([])

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

  const onClickConfigure = (row: RowType) => {
    props.setId(row.pid)
    props.setConfigureChain(row.chainId)
    props.setShowApprovePayoutProcess(row.showApprovePayoutProcess)
    props.setInterval(row.interval)
    props.setFeeBlockTarget(row.feeBlockTarget)
    props.setThreshold(row.threshold)

    props.setIsConfigure(true)
  }

  const init = async (userId: number, storeId: number, network: string) => {
    try {
      const response: any = await axios.get(Http.find_payout_setting, {
        params: {
          user_id: userId,
          store_id: storeId,
          network: network === 'mainnet' ? 1 : 2,
        },
      })

      if (response.result) {
        const rows: RowType[] = (response.data ?? []).map((item: any, index: number) => ({
          id: index + 1,
          pid: item.id,
          chainId: item.chainId,
          showApprovePayoutProcess: item.showApprovePayoutProcess === 1,
          interval: item.interval,
          feeBlockTarget: item.feeBlockTarget,
          threshold: item.threshold,
        }))

        setRows(rows)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  useEffect(() => {
    init(userId, storeId, network)
  }, [userId, storeId, network])

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Payment Method</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows && rows.length > 0 ? (
            rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{FindChainNamesByChains(row.chainId)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => onClickConfigure(row)}>
                    Configure
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                No rows
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
