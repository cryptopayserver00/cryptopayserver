import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Copy, EyeOff } from 'lucide-react'
import { useSnackPresistStore, useUserPresistStore, useWalletPresistStore } from '@/lib/store'
import { BLOCKCHAIN, BLOCKCHAINNAMES } from '@/packages/constants/blockchain'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { FindChainIdsByChainNames, GetBlockchainAddressUrlByChainIds } from '@/utils/web3'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { useShallow } from 'zustand/react/shallow'
import { PrivateKeyRowType } from '@/utils/types'

const ManagePrivateKey = () => {
  const [blockchains, setBlockchains] = useState<BLOCKCHAIN[]>()
  const [currentItem, setCurrentItem] = useState<BLOCKCHAIN>()
  const [open, setOpen] = useState<boolean>(false)
  const [rows, setRows] = useState<PrivateKeyRowType[]>([])

  const { network } = useUserPresistStore(
    useShallow((state) => ({
      network: state.network,
    }))
  )

  const { walletId } = useWalletPresistStore(
    useShallow((state) => ({
      walletId: state.walletId,
    }))
  )

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      setSnackSeverity: state.setSnackSeverity,
      setSnackMessage: state.setSnackMessage,
      setSnackOpen: state.setSnackOpen,
    }))
  )

  const showSnack = (severity: 'success' | 'error', message: string) => {
    setSnackSeverity(severity)
    setSnackMessage(message)
    setSnackOpen(true)
  }

  const onClickPrivateKeyItem = async (item: BLOCKCHAIN) => {
    try {
      const response: any = await axios.get(Http.find_private_key_by_chain_and_network, {
        params: {
          wallet_id: walletId,
          chain_id: FindChainIdsByChainNames(item.name),
          network: item.isMainnet ? 1 : 2,
        },
      })

      if (response.result && response.data.length > 0) {
        const rows: PrivateKeyRowType[] = response.data.map((element: any) => ({
          chainId: FindChainIdsByChainNames(item.name),
          isMainnet: item.isMainnet,
          address: element.address,
          privateKey: element.private_key,
          view: false,
        }))

        setRows(rows)
      } else {
        showSnack('error', 'Can not find the data on site!')
      }

      setCurrentItem(item)
      setOpen(true)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    const value = BLOCKCHAINNAMES.filter((item: any) =>
      network === 'mainnet' ? item.isMainnet : !item.isMainnet
    )
    setBlockchains(value)
  }, [network])

  const toggleView = (index: number, value: boolean) => {
    const newRows = [...rows]
    newRows[index].view = value
    setRows(newRows)
  }

  return (
    <div>
      <div className="mx-auto max-w-screen-lg px-4">
        <h2 className="text-lg font-semibold">Private Key</h2>

        <nav className="mt-4 rounded-lg border bg-card">
          {blockchains &&
            blockchains.length > 0 &&
            blockchains.map((item, index) => (
              <button
                key={index}
                onClick={() => onClickPrivateKeyItem(item)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
              >
                <Image src={item.icon} alt="image" width={40} height={40} className="h-10 w-10" />
                <span className="flex-1 font-medium">{item.name}</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            ))}
        </nav>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
            <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
              <DialogTitle>{currentItem?.name}</DialogTitle>
            </DialogHeader>

            <div className="overflow-y-auto px-6">
              <div className="space-y-6 py-2">
                {rows?.map((item, index) => (
                  <div key={index}>
                    {index > 0 && <Separator className="mb-6" />}

                    <Link
                      href={GetBlockchainAddressUrlByChainIds(
                        item.isMainnet,
                        item.chainId,
                        item.address
                      )}
                      target="_blank"
                      className="break-all text-sm text-primary hover:underline"
                    >
                      {item.address}
                    </Link>

                    <div className="mt-3">
                      {item.view ? (
                        <Textarea
                          value={item.privateKey}
                          disabled
                          rows={5}
                          className="resize-none font-mono text-xs whitespace-pre-wrap break-all"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleView(index, true)}
                          className="flex w-full flex-col items-center gap-1 rounded-md bg-black/90 px-4 py-6 text-center text-white transition-opacity hover:opacity-90"
                        >
                          <EyeOff className="h-6 w-6" />
                          <span className="mt-1 text-sm font-medium">
                            Click to view private key
                          </span>
                          <span className="text-xs text-white/70">
                            Please make sure no one can view your screen
                          </span>
                        </button>
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-end gap-2">
                      {item.view ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleView(index, false)}
                        >
                          Hide
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-amber-500 text-white hover:bg-amber-600"
                          onClick={() => toggleView(index, true)}
                        >
                          View
                        </Button>
                      )}

                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={async () => {
                          await navigator.clipboard.writeText(item.privateKey)
                          showSnack('success', 'Successfully copy')
                        }}
                      >
                        <Copy className="mr-1.5 h-3.5 w-3.5" />
                        Copy
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="pr-10 pb-8 shrink-0 border-t">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default ManagePrivateKey
