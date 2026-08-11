// import { useEffect, useState } from 'react';
// import { Button } from '@mui/material';
// import { Send } from '@mui/icons-material';
// import { AppKit, createAppKit, useAppKitNetwork } from '@reown/appkit/react';
// import { AppKitNetwork } from '@reown/appkit/networks';
// import { CHAINIDS, CHAINS } from '@/packages/constants/blockchain';
// import { GetWalletConnectNetwork, GetChainIds, GetAllSupportAppKitNetwork } from '@/utils/web3';
// import { useAppKitAccount } from '@reown/appkit/react';
// import {
//   useSwitchChain,
//   useSignMessage,
//   useEstimateGas,
//   useSendTransaction,
//   usePrepareTransactionRequest,
// } from 'wagmi';
// import { Hex, parseGwei, type Address } from 'viem';
// import { useAppKit } from '@reown/appkit/react';
// import { useSnackPresistStore } from '@/lib/store';
// import { ethers } from 'ethers';
// import { IsHexAddress } from '@/utils/strings';
// // import { ERC20Abi } from '../abi/erc20';
// import { ERC20Abi } from '@/packages/web3/abi/erc20';

// type WalletConnectType = {
//   network: number;
//   chainId: CHAINS;
//   address: string;
//   contractAddress?: string;
//   decimals?: number;
//   value: string;
//   buttonSize?: 'small' | 'medium' | 'large';
//   buttonVariant?: 'text' | 'outlined' | 'contained';
//   fullWidth?: boolean;
//   color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
// };

// const WalletConnectButton = (props: WalletConnectType) => {
//   const [connectNetwork, setConnectNetwork] = useState<AppKitNetwork>();
//   const { chainId, switchNetwork } = useAppKitNetwork();

//   const { setSnackOpen, setSnackSeverity, setSnackMessage } = useSnackPresistStore((state) => state);

//   const { open, close } = useAppKit();
//   const { address, isConnected } = useAppKitAccount();

//   const { data: hash, sendTransaction } = useSendTransaction();

//   const handleSendTx = async () => {
//     try {
//       if (!connectNetwork) return;

//       if (connectNetwork.id != chainId) {
//         setSnackSeverity('error');
//         setSnackMessage(
//           'The current network is incorrect, please switch to the correct network environment: ' + connectNetwork.name,
//         );
//         setSnackOpen(true);
//         await open();
//         return;
//       }

//       if (!IsHexAddress(props.address)) {
//         return;
//       }

//       if (props.contractAddress) {
//         const value = ethers.parseUnits(String(props.value), props.decimals).toString();
//         const iface = new ethers.Interface(ERC20Abi);
//         const data = iface.encodeFunctionData('transfer', [props.address, value]);

//         await sendTransaction({
//           data: data as `0x${string}`,
//           to: props.contractAddress as `0x${string}`,
//           value: 0 as any,
//         });
//       } else {
//         await sendTransaction({
//           to: props.address,
//           value: ethers.parseEther(String(props.value)),
//         });
//       }
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   const onClickWalletConnect = async () => {
//     try {
//       if (!connectNetwork) {
//         return;
//       }

//       if (isConnected) {
//         await handleSendTx();
//       } else {
//         await open();
//       }
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   useEffect(() => {
//     if (hash) {
//       setSnackSeverity('success');
//       setSnackMessage('You sent a transaction successfully');
//       setSnackOpen(true);
//     }
//   }, [hash, setSnackSeverity, setSnackMessage, setSnackOpen]);

//   useEffect(() => {
//     if (!props.network || !props.chainId || !props.address) {
//       return;
//     }

//     const chainids = GetChainIds(props.network === 1 ? true : false, props.chainId);

//     if (!chainids) {
//       return;
//     }

//     const connectNetwork = GetWalletConnectNetwork(chainids);

//     if (!connectNetwork) {
//       return;
//     }

//     setConnectNetwork(connectNetwork);
//   }, [props.network, props.chainId, props.address]);

//   return (
//     <>
//       {connectNetwork && (
//         <Button
//           color={props.color ? props.color : 'primary'}
//           fullWidth={props.fullWidth}
//           variant={props.buttonVariant ? props.buttonVariant : 'contained'}
//           size={props.buttonSize ? props.buttonSize : 'medium'}
//           endIcon={<Send />}
//           onClick={() => {
//             onClickWalletConnect();
//           }}
//         >
//           {isConnected ? 'Send Transaction' : 'Connect Wallet'}
//         </Button>
//       )}
//     </>
//   );
// };

// export default WalletConnectButton;

import { useEffect, useState } from 'react'
import { Send, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppKitNetwork } from '@reown/appkit/networks'
import { CHAINIDS, CHAINS } from '@/packages/constants/blockchain'
import { GetWalletConnectNetwork, GetChainIds } from '@/utils/web3'
import { useAppKitAccount, useAppKit, useAppKitNetwork } from '@reown/appkit/react'
import { useSendTransaction } from 'wagmi'
import { ethers } from 'ethers'
import { useSnackPresistStore } from '@/lib/store'
import { IsHexAddress } from '@/utils/strings'
import { ERC20Abi } from '@/packages/web3/abi/erc20'
import { cn } from '@/lib/utils'

type WalletConnectType = {
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
  const { chainId } = useAppKitNetwork()

  const { setSnackOpen, setSnackSeverity, setSnackMessage } = useSnackPresistStore((state) => state)

  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const { data: hash, sendTransaction } = useSendTransaction()

  const handleSendTx = async () => {
    try {
      if (!connectNetwork) return

      if (connectNetwork.id != chainId) {
        setSnackSeverity('error')
        setSnackMessage(
          'The current network is incorrect, please switch to the correct network environment: ' +
            connectNetwork.name
        )
        setSnackOpen(true)
        await open()
        return
      }

      if (!IsHexAddress(props.address)) {
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
        await open()
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
      return
    }

    const chainids = GetChainIds(props.network === 1 ? true : false, props.chainId)

    if (!chainids) return

    const network = GetWalletConnectNetwork(chainids)
    if (!network) return

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
