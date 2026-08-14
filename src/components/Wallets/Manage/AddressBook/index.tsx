import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { FindChainIdsByChainNames, FindChainNamesByChains } from '@/utils/web3'
import { CHAINNAMES } from '@/packages/constants/blockchain'
import { GetImgSrcByChain } from '@/utils/qrcode'
import { useShallow } from 'zustand/react/shallow'
import { AddressBookRowType } from '@/utils/types'

const ManageAddressBook = () => {
  const [rows, setRows] = useState<AddressBookRowType[]>([])
  const [open, setOpen] = useState<boolean>(false)

  const [selectId, setSelectId] = useState<number>(0)
  const [name, setName] = useState<string>('')
  const [address, setAddress] = useState<string>('')
  const [chainName, setChainName] = useState<CHAINNAMES>()

  const { network, userId } = useUserPresistStore(
    useShallow((state) => ({
      network: state.network,
      userId: state.userId,
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

  const onClickDelete = async (id: number) => {
    if (!id) {
      setSnackSeverity('error')
      setSnackMessage('Incorrect selected')
      setSnackOpen(true)
      return
    }

    try {
      const response: any = await axios.put(Http.delete_address_book_by_id, { id })

      if (response.result) {
        await init(storeId, network)
        handleClose()
        setSnackSeverity('success')
        setSnackMessage('Successful delete')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  const onClickConfirm = async () => {
    if (!name) {
      setSnackSeverity('error')
      setSnackMessage('Incorrect name')
      setSnackOpen(true)
      return
    }
    if (!address) {
      setSnackSeverity('error')
      setSnackMessage('Incorrect address')
      setSnackOpen(true)
      return
    }
    if (!chainName) {
      setSnackSeverity('error')
      setSnackMessage('Incorrect chainName')
      setSnackOpen(true)
      return
    }

    try {
      if (selectId && selectId > 0) {
        const response: any = await axios.put(Http.update_address_book_by_id, {
          id: selectId,
          name,
          address,
          chain_id: FindChainIdsByChainNames(chainName),
          network: network === 'mainnet' ? 1 : 2,
        })

        if (response.result) {
          await init(storeId, network)
          handleClose()
          setSnackSeverity('success')
          setSnackMessage('Successful update')
          setSnackOpen(true)
        } else {
          setSnackSeverity('error')
          setSnackMessage('creation failed, incorrect address or already exists')
          setSnackOpen(true)
        }
      } else {
        const response: any = await axios.post(Http.create_address_book, {
          user_id: userId,
          store_id: storeId,
          chain_id: FindChainIdsByChainNames(chainName),
          network: network === 'mainnet' ? 1 : 2,
          name,
          address,
        })

        if (response.result && response.data.id) {
          await init(storeId, network)
          handleClose()
          setSnackSeverity('success')
          setSnackMessage('Successful creation!')
          setSnackOpen(true)
        } else {
          setSnackSeverity('error')
          setSnackMessage('creation failed, incorrect address or already exists')
          setSnackOpen(true)
        }
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  const handleOpen = () => setOpen(true)

  const handleClose = () => {
    setName('')
    setAddress('')
    setChainName(undefined)
    setSelectId(0)
    setOpen(false)
  }

  const init = async (storeId: number, network: string) => {
    try {
      const response: any = await axios.get(Http.find_address_book, {
        params: { store_id: storeId, network: network === 'mainnet' ? 1 : 2 },
      })
      if (response.result && response.data.length > 0) {
        let rt: AddressBookRowType[] = []
        response.data.forEach((item: any) => {
          rt.push({
            id: item.id,
            chainId: item.chain_id,
            isMainnet: item.network === 1,
            name: item.name,
            address: item.address,
          })
        })
        setRows(rt)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  useEffect(() => {
    init(storeId, network)
  }, [storeId, network])

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="text-lg font-semibold">Address Book ({rows.length})</h1>

      <Button className="mt-4 w-full" onClick={handleOpen}>
        Add an address
      </Button>

      <div className="mt-4 space-y-2">
        {rows.map((item, index) => (
          <Card key={index} className="flex w-full items-center justify-between p-4">
            <div
              className="flex flex-1 cursor-pointer items-center"
              onClick={() => {
                setSelectId(item.id)
                setName(item.name)
                setAddress(item.address)
                setChainName(FindChainNamesByChains(item.chainId))
                handleOpen()
              }}
            >
              <Image
                src={GetImgSrcByChain(item.chainId)}
                alt="image"
                width={40}
                height={40}
                className="h-10 w-10"
              />
              <div className="ml-3">
                <p className="font-bold">{item.name}</p>
                <p className="mt-1 font-mono text-sm text-muted-foreground">{item.address}</p>
              </div>
            </div>

            <Button variant="ghost" size="icon" onClick={() => onClickDelete(item.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={(o) => (o ? handleOpen() : handleClose())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add an address</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Please enter a name, up to 20 characters"
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Please enter the address"
              />
            </div>
            <div className="space-y-2">
              <Label>Network</Label>
              <Select value={chainName} onValueChange={(v) => setChainName(v as CHAINNAMES)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select the network" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CHAINNAMES).map((item, index) => (
                    <SelectItem value={item[1]} key={index}>
                      {item[1]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
            <Button onClick={onClickConfirm}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ManageAddressBook
