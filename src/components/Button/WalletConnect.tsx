import { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { Send } from '@mui/icons-material';
import { AppKit, createAppKit, useAppKitNetwork } from '@reown/appkit/react';
import { wagmiAdapter } from 'components/Common/Providers/WagmiAdapter';
import {
  mainnet,
  arbitrum,
  avalanche,
  base,
  optimism,
  polygon,
  sepolia,
  AppKitNetwork,
  bsc,
  bscTestnet,
} from '@reown/appkit/networks';
import { CHAINIDS, CHAINS } from 'packages/constants/blockchain';
import { GetWalletConnectNetwork, GetChainIds, GetAllSupportAppKitNetwork } from 'utils/web3';
import { useAppKitAccount } from '@reown/appkit/react';
import { useSwitchChain, useSignMessage, useEstimateGas, useSendTransaction } from 'wagmi';
import { parseGwei, type Address } from 'viem';
import { useAppKit } from '@reown/appkit/react';

type WalletConnectType = {
  network: string;
  chainId: CHAINS;
  address: string;
};

const WalletConnect = (props: WalletConnectType) => {
  const [connectNetwork, setConnectNetwork] = useState<AppKitNetwork>();
  const { chainId, switchNetwork } = useAppKitNetwork();

  const { open, close } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const TX = {
    to: props.address as Address,
    // value: 0,
  };

  const { data: gas } = useEstimateGas({ ...TX });

  const { data: hash, sendTransaction } = useSendTransaction();

  const handleSendTx = async () => {
    try {
      if (!connectNetwork) return;

      if (connectNetwork.id != chainId) {
        switchNetwork(connectNetwork);
      }

      // await appKit.switchNetwork(connectNetwork);
      // await switchChain({ chainId: connectNetwork?.id });

      await sendTransaction({
        to: props.address,
        value: 0,
        gas,
      });
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
    if (!props.network || !props.chainId || !props.address) {
      return;
    }

    const chainids = GetChainIds(props.network === 'mainnet' ? true : false, props.chainId);

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
      variant="contained"
      endIcon={<Send />}
      onClick={() => {
        onClickWalletConnect();
      }}
    >
      Connect Wallet
    </Button>
  );
};

export default WalletConnect;
