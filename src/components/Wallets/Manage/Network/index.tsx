import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useUserPresistStore } from '@/lib/store'
import { BLOCKCHAIN, BLOCKCHAINNAMES } from '@/packages/constants/blockchain'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useShallow } from 'zustand/react/shallow'

const ManageNetwork = () => {
  const [blockchains, setBlockchains] = useState<BLOCKCHAIN[]>()
  const [currentItem, setCurrentItem] = useState<BLOCKCHAIN>()
  const [open, setOpen] = useState<boolean>(false)

  const { network } = useUserPresistStore(
    useShallow((state) => ({
      network: state.network,
    }))
  )

  const onClickAddNetwork = async () => {}

  useEffect(() => {
    const value = BLOCKCHAINNAMES.filter((item: any) =>
      network === 'mainnet' ? item.isMainnet : !item.isMainnet
    )
    setBlockchains(value)
  }, [network])

  return (
    <div>
      <div className="mx-auto max-w-screen-lg px-4">
        <h2 className="text-lg font-semibold">Customize Network</h2>

        <Button className="mt-4 w-full" onClick={() => onClickAddNetwork()}>
          Add a network
        </Button>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {blockchains &&
            blockchains.length > 0 &&
            blockchains.map((item, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Image
                        src={item.icon}
                        alt="image"
                        width={40}
                        height={40}
                        className="h-10 w-10"
                      />
                      <span className="font-semibold">{item.name}</span>
                    </div>
                    <Badge className="border-transparent bg-green-100 text-green-800 hover:bg-green-100">
                      Active
                    </Badge>
                  </div>

                  <p className="mt-3 text-sm text-muted-foreground">{item.desc}</p>

                  <Button
                    variant="outline"
                    className="mt-4 w-full"
                    onClick={() => {
                      setCurrentItem(item)
                      setOpen(true)
                    }}
                  >
                    Check Network
                  </Button>
                </CardContent>
              </Card>
            ))}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentItem?.name}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Network name</Label>
                <Input value={currentItem?.name ?? ''} disabled />
              </div>

              <div className="space-y-1.5">
                <Label>RPC URL</Label>
                <div className="space-y-2">
                  {currentItem?.rpc &&
                    currentItem.rpc.map((item, index) => (
                      <Input key={index} value={item} disabled />
                    ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Chain ID</Label>
                <Input value={currentItem?.chainId ?? ''} disabled />
              </div>

              <div className="space-y-1.5">
                <Label>Symbol</Label>
                <Input value={currentItem?.coins[0]?.symbol ?? ''} disabled />
              </div>

              <div className="space-y-1.5">
                <Label>Website</Label>
                <Input value={currentItem?.websiteUrl ?? ''} disabled />
              </div>

              <div className="space-y-1.5">
                <Label>Blockchain browser</Label>
                <Input value={currentItem?.explorerUrl ?? ''} disabled />
              </div>
            </div>

            <DialogFooter>
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

export default ManageNetwork
