import { useEffect, useState } from 'react'
import { Send, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppKitNetwork } from '@reown/appkit/networks'
import { CHAINS } from '@/packages/constants/blockchain'
import {
  GetWalletConnectNetwork,
  GetChainIds,
  IsEvmWalletConnectChain,
} from '@/utils/web3'
import { useAppKitAccount, useAppKit, useAppKitNetwork } from '@reown/appkit/react'
import { useSendTransaction } from 'wagmi'
import { ethers } from 'ethers'
import { useSnackPresistStore } from '@/lib/store'
import { IsHexAddress } from '@/utils/strings'
import { ERC20Abi } from '@/packages/web3/abi/erc20'
import { cn } from '@/lib/utils'
import { useShallow } from 'zustand/react/shallow'

interface WalletConnectType {
  network: number
  chainId: CHAINS
  address: string
  contractAddress?: string
  decimals?: number
  value: string
  buttonSize?: 'sm' | 'default' | 'lg'
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link'
  fullWidth?: boolean
  className?: string
}

const WalletConnectButton = (props: WalletConnectType) => {
  const [connectNetwork, setConnectNetwork] = useState<AppKitNetwork>()
  const { chainId, switchNetwork } = useAppKitNetwork()

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      setSnackSeverity: state.setSnackSeverity,
      setSnackMessage: state.setSnackMessage,
      setSnackOpen: state.setSnackOpen,
    }))
  )

  const { open } = useAppKit()
  const { isConnected } = useAppKitAccount()
  const { data: hash, sendTransaction } = useSendTransaction()

  const ensureCorrectNetwork = async (): Promise<boolean> => {
    if (!connectNetwork) return false

    if (String(connectNetwork.id) === String(chainId)) {
      return true
    }

    try {
      await switchNetwork(connectNetwork)
      return true
    } catch (e) {
      console.error(e)
      setSnackSeverity('error')
      setSnackMessage(
        `Please switch your wallet to ${connectNetwork.name} before sending`
      )
      setSnackOpen(true)
      await open({ view: 'Networks' })
      return false
    }
  }

  const handleSendTx = async () => {
    try {
      if (!connectNetwork) return

      if (!(await ensureCorrectNetwork())) {
        return
      }

      if (!IsHexAddress(props.address)) {
        setSnackSeverity('error')
        setSnackMessage('This payment address is not an EVM address')
        setSnackOpen(true)
        return
      }

      if (props.contractAddress) {
        const value = ethers.parseUnits(String(props.value), props.decimals).toString()
        const iface = new ethers.Interface(ERC20Abi)
        const data = iface.encodeFunctionData('transfer', [props.address, value])

        await sendTransaction({
          data: data as `0x${string}`,
          to: props.contractAddress as `0x${string}`,
          value: 0 as any,
        })
      } else {
        await sendTransaction({
          to: props.address as `0x${string}`,
          value: ethers.parseEther(String(props.value)),
        })
      }
    } catch (e) {
      console.error(e)
    }
  }

  const onClickWalletConnect = async () => {
    try {
      if (!connectNetwork) return

      if (isConnected) {
        await handleSendTx()
      } else {
        try {
          await switchNetwork(connectNetwork)
        } catch {
          // User may not be connected yet; open modal and ask them to pick the right chain
        }
        await open({ view: 'Connect' })
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (hash) {
      setSnackSeverity('success')
      setSnackMessage('You sent a transaction successfully')
      setSnackOpen(true)
    }
  }, [hash, setSnackSeverity, setSnackMessage, setSnackOpen])

  useEffect(() => {
    if (!props.network || !props.chainId || !props.address) {
      setConnectNetwork(undefined)
      return
    }

    // wagmi AppKit can only send on EVM chains — hide for BTC/XRP/Solana/etc.
    if (!IsEvmWalletConnectChain(props.chainId)) {
      setConnectNetwork(undefined)
      return
    }

    const chainids = GetChainIds(props.network === 1, props.chainId)
    if (!chainids) {
      setConnectNetwork(undefined)
      return
    }

    const network = GetWalletConnectNetwork(chainids)
    setConnectNetwork(network)
  }, [props.network, props.chainId, props.address])

  if (!connectNetwork) return null

  return (
    <Button
      variant={props.buttonVariant ?? 'default'}
      size={props.buttonSize ?? 'default'}
      className={cn('gap-2', props.fullWidth && 'w-full', props.className)}
      onClick={onClickWalletConnect}
    >
      {isConnected ? (
        <>
          <Send className="h-4 w-4" />
          Send Transaction
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </>
      )}
    </Button>
  )
}

export default WalletConnectButton
