import { useEffect, useState } from 'react'
import Image from 'next/image'
import { AlertCircle, ChevronDown, Info, Wallet } from 'lucide-react'
import {
  useSnackPresistStore,
  useStorePresistStore,
  useUserPresistStore,
  useWalletPresistStore,
} from '@/lib/store'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { BLOCKCHAINNAMES, CHAINNAMES, CHAINS, COINS } from '@/packages/constants/blockchain'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { useShallow } from 'zustand/react/shallow'
import { BlockchainCoinType, BlockchainType } from '@/utils/types'

const ManageWallet = () => {
  const [openExplain, setOpenExplain] = useState<boolean>(false)
  const [walletName, setWalletName] = useState<string>('')
  const [newWalletName, setNewWalletName] = useState<string>('')
  const [isBackup, setIsBackup] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(false)
  const [blockchains, setBlockchains] = useState<BlockchainType[]>([])

  const { network, userId } = useUserPresistStore(
    useShallow((state) => ({
      network: state.network,
      userId: state.userId,
    }))
  )

  const { walletId } = useWalletPresistStore(
    useShallow((state) => ({
      walletId: state.walletId,
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

  const showSnack = (severity: 'success' | 'error', message: string) => {
    setSnackSeverity(severity)
    setSnackMessage(message)
    setSnackOpen(true)
  }

  const handleClose = () => {
    setNewWalletName('')
    setOpen(false)
  }

  const getWalletInfo = async (walletId: number) => {
    try {
      const response: any = await axios.get(Http.find_wallet_by_id, {
        params: {
          id: walletId,
        },
      })

      if (response.result && response.data) {
        setWalletName(response.data.name)
        setIsBackup(response.data.isBackup === 1)
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    }
  }

  const onClickRename = async () => {
    try {
      if (!newWalletName || newWalletName === '') {
        showSnack('error', 'Incorrect name input')
        return
      }

      const response: any = await axios.put(Http.update_name_by_wallet_id, {
        wallet_id: walletId,
        name: newWalletName,
      })
      if (response.result) {
        await getWalletInfo(walletId)
        handleClose()
        showSnack('success', 'Successful update!')
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    }
  }

  const onChangeCoin = async (chainId: CHAINS, coinName: COINS) => {
    try {
      const response: any = await axios.put(Http.update_wallet_coin_enable_by_id, {
        user_id: userId,
        store_id: storeId,
        chain_id: chainId,
        name: coinName,
        network: network === 'mainnet' ? 1 : 2,
      })

      if (response.result) {
        await getWalletManage(walletId, storeId, network)
        showSnack('success', 'Update successful!')
      } else {
        showSnack('error', 'Update failed!')
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    }
  }

  const getWalletManage = async (walletId: number, storeId: number, network: string) => {
    try {
      const response: any = await axios.get(Http.find_wallet_manage_by_network, {
        params: {
          wallet_id: walletId,
          store_id: storeId,
          network: network === 'mainnet' ? 1 : 2,
        },
      })
      if (response.result) {
        const respBalances = response.data.balances
        const respCoins = response.data.coins
        const respScan = response.data.scan

        const blockchain = BLOCKCHAINNAMES.filter((item) =>
          network === 'mainnet' ? item.isMainnet : !item.isMainnet
        )

        let blockchains: BlockchainType[] = []
        for (const chain of blockchain) {
          let blockchain: BlockchainType = {
            icon: chain.icon,
            name: chain.name,
            desc: chain.desc,
            coins: [],
          }

          let coins: BlockchainCoinType[] = []
          for (const coin of chain.coins) {
            let blockchainCoin: BlockchainCoinType = {
              chainId: coin.chainId,
              icon: coin.icon,
              name: coin.name,
              isMainCoin: coin.isMainCoin,
              address: '',
              enabled: false,
              scan: false,
            }

            const findBalance = respBalances?.find((item: any) => item.chainId === coin.chainId)
            blockchainCoin.address = findBalance.address ? findBalance?.address : ''
            blockchainCoin.enabled = respCoins?.find(
              (item: any) => item.chainId === coin.chainId && item.name === coin.name
            ).enabled

            if (respScan.result) {
              blockchainCoin.scan = true
            } else {
              const hasScan = respScan.data?.find(
                (item: any) =>
                  item.chainId === coin.chainId && item.address === blockchainCoin.address
              )

              blockchainCoin.scan = hasScan ? false : true
            }

            coins.push(blockchainCoin)
          }

          blockchain.coins = coins
          blockchains.push(blockchain)
        }

        setBlockchains(blockchains)
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    }
  }

  const onClickRefresh = async () => {
    await getWalletManage(walletId, storeId, network)
  }

  const init = async (storeId: number, walletId: number, network: string) => {
    await Promise.all([getWalletInfo(walletId), getWalletManage(walletId, storeId, network)])
  }

  useEffect(() => {
    getWalletInfo(walletId)
  }, [walletId])

  useEffect(() => {
    getWalletManage(walletId, storeId, network)
  }, [walletId, storeId, network])

  const defaultExpandedValues = blockchains.slice(0, 2).map((_, index) => `item-${index}`)

  return (
    <div>
      <div className="mx-auto max-w-screen-lg px-4">
        <h2 className="text-lg font-semibold">Wallet Manage</h2>

        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Wallet className="h-7 w-7 text-muted-foreground" />
                <span className="font-semibold">{walletName ? walletName : 'UNKOWN NAME'}</span>
                <Badge
                  className={cn(
                    'border-transparent',
                    isBackup
                      ? 'bg-green-100 text-green-800 hover:bg-green-100'
                      : 'bg-red-100 text-red-800 hover:bg-red-100'
                  )}
                >
                  {isBackup ? 'Backed up' : 'Not backed up'}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={() => setOpen(true)}>Rename wallet</Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    window.location.href = '/wallet/phrase/intro'
                  }}
                >
                  Go back up
                </Button>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between pb-4">
                <div className="flex items-center gap-1">
                  <h3 className="text-lg font-semibold">Coin Manage</h3>
                  <Button variant="ghost" size="icon" onClick={() => setOpenExplain(!openExplain)}>
                    <Info className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </div>

                <Button className="bg-green-600 hover:bg-green-700" onClick={onClickRefresh}>
                  Refresh
                </Button>
              </div>

              {openExplain && (
                <Alert className="mb-4 border-blue-200 bg-blue-50 text-blue-900">
                  <Info className="h-4 w-4 !text-blue-600" />
                  <AlertTitle>Info</AlertTitle>
                  <AlertDescription className="space-y-2 text-blue-800">
                    <p>Refresh: All data of the blockchain tokens will be refreshed.</p>
                    <p>
                      Scanned or no scan: Whether the address used by this coin is within the
                      scanning range; if within the range, it will be processed for creating the
                      order. &quot;Scanned&quot; indicates it exists, &quot;No Scan&quot; indicates
                      it does not exist.
                    </p>
                    <p>
                      Enable or Disable: Click the following button to enable or disable the display
                      of this token, involving all the users who create invoices.
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              {blockchains && blockchains.length > 0 && (
                <Accordion type="multiple" defaultValue={defaultExpandedValues}>
                  {blockchains.map((item, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          <Image
                            src={item.icon}
                            alt="icon"
                            width={40}
                            height={40}
                            className="h-10 w-10"
                          />
                          <span>{item.name}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground">{item.desc}</p>
                        <p className="py-3 font-semibold text-amber-600">
                          Click the following button to enable or disable the display of this token
                        </p>

                        <div className="space-y-3">
                          {item.coins &&
                            item.coins.length > 0 &&
                            item.coins.map((coinItem, coinIndex) => (
                              <div
                                key={coinIndex}
                                className="flex flex-wrap items-center justify-between gap-2"
                              >
                                <div className="flex flex-wrap items-center gap-2">
                                  <Image
                                    src={coinItem.icon}
                                    alt="icon"
                                    width={40}
                                    height={40}
                                    className="h-10 w-10"
                                  />
                                  <span>{coinItem.name}</span>
                                  {coinItem.isMainCoin && (
                                    <Badge className="border-transparent bg-sky-100 text-sky-800 hover:bg-sky-100">
                                      main coin
                                    </Badge>
                                  )}
                                  {coinItem.scan ? (
                                    <Badge className="border-transparent bg-green-100 text-green-800 hover:bg-green-100">
                                      Scanned
                                    </Badge>
                                  ) : (
                                    <Badge className="border-transparent bg-red-100 text-red-800 hover:bg-red-100">
                                      No Scan
                                    </Badge>
                                  )}
                                </div>
                                <Switch
                                  checked={coinItem.enabled}
                                  onCheckedChange={() =>
                                    onChangeCoin(coinItem.chainId, coinItem.name)
                                  }
                                />
                              </div>
                            ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename Wallet</DialogTitle>
            </DialogHeader>

            <Input
              autoFocus
              value={newWalletName}
              onChange={(e) => setNewWalletName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onClickRename()
              }}
            />

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={onClickRename}>
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default ManageWallet
