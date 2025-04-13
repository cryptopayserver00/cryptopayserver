import { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { Send } from '@mui/icons-material';
import { AppKit, createAppKit, useAppKitNetwork } from '@reown/appkit/react';
import { AppKitNetwork } from '@reown/appkit/networks';
import { CHAINIDS, CHAINS } from 'packages/constants/blockchain';
import { GetWalletConnectNetwork, GetChainIds, GetAllSupportAppKitNetwork } from 'utils/web3';
import { useAppKitAccount } from '@reown/appkit/react';
import {
  useSwitchChain,
  useSignMessage,
  useEstimateGas,
  useSendTransaction,
  usePrepareTransactionRequest,
} from 'wagmi';
import { Hex, parseGwei, type Address } from 'viem';
import { useAppKit } from '@reown/appkit/react';
import { useSnackPresistStore } from 'lib/store';
import { ethers } from 'ethers';
import { IsHexAddress } from 'utils/strings';
// import { ERC20Abi } from '../abi/erc20';
import { ERC20Abi } from 'packages/web3/abi/erc20';

type WalletConnectType = {
  network: number;
  chainId: CHAINS;
  address: string;
  contractAddress?: string;
  decimals?: number;
  value: string;
  buttonSize?: 'small' | 'medium' | 'large';
  buttonVariant?: 'text' | 'outlined' | 'contained';
  fullWidth?: boolean;
};

const WalletConnectButton = (props: WalletConnectType) => {
  const [connectNetwork, setConnectNetwork] = useState<AppKitNetwork>();
  const { chainId, switchNetwork } = useAppKitNetwork();

  const { setSnackOpen, setSnackSeverity, setSnackMessage } = useSnackPresistStore((state) => state);

  const { open, close } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  const { data: hash, sendTransaction } = useSendTransaction();

  const handleSendTx = async () => {
    try {
      if (!connectNetwork) return;

      if (connectNetwork.id != chainId) {
        setSnackSeverity('error');
        setSnackMessage(
          'The current network is incorrect, please switch to the correct network environment: ' + connectNetwork.name,
        );
        setSnackOpen(true);
        await open();
        return;
      }

      if (!IsHexAddress(props.address)) {
        return;
      }

      if (props.contractAddress) {
        const value = ethers.parseUnits(String(props.value), props.decimals).toString();
        const iface = new ethers.Interface(ERC20Abi);
        const data = iface.encodeFunctionData('transfer', [props.address, value]);

        await sendTransaction({
          data: data,
          to: props.contractAddress,
          value: 0,
        });
      } else {
        await sendTransaction({
          to: props.address,
          value: ethers.parseEther(String(props.value)),
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const onClickWalletConnect = async () => {
    try {
      if (!connectNetwork) {
        return;
      }

      if (isConnected) {
        await handleSendTx();
      } else {
        await open();
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (hash) {
      setSnackSeverity('success');
      setSnackMessage('You sent a transaction successfully');
      setSnackOpen(true);
    }
  }, [hash, setSnackSeverity, setSnackMessage, setSnackOpen]);

  useEffect(() => {
    if (!props.network || !props.chainId || !props.address) {
      return;
    }

    const chainids = GetChainIds(props.network === 1 ? true : false, props.chainId);

    if (!chainids) {
      return;
    }

    const connectNetwork = GetWalletConnectNetwork(chainids);

    if (!connectNetwork) {
      return;
    }

    setConnectNetwork(connectNetwork);
  }, [props.network, props.chainId, props.address]);

  return (
    <Button
      fullWidth={props.fullWidth}
      variant={props.buttonVariant ? props.buttonVariant : 'contained'}
      size={props.buttonSize ? props.buttonSize : 'medium'}
      endIcon={<Send />}
      onClick={() => {
        onClickWalletConnect();
      }}
    >
      {isConnected ? 'Send Transaction' : 'Connect Wallet'}
    </Button>
  );
};

export default WalletConnectButton;
