import { useEffect } from 'react';
import { Button } from '@mui/material';
import { Send } from '@mui/icons-material';
import { createAppKit } from '@reown/appkit/react';
import { wagmiAdapter, projectId } from 'components/Common/Providers/WagmiAdapter';
import { mainnet, arbitrum, avalanche, base, optimism, polygon } from '@reown/appkit/networks';
import { CHAINIDS, CHAINS } from 'packages/constants/blockchain';
import { GetWalletConnectNetwork, GetChainIds } from 'utils/web3';

const metadata = {
  name: 'cryptopayserver',
  description: 'AppKit Example',
  url: 'https://reown.com/appkit', // origin must match your domain & subdomain
  icons: ['https://assets.reown.com/reown-profile-pic.png'],
};

type WalletConnectType = {
  network: string;
  chainId: CHAINS;
};

const WalletConnect = (props: WalletConnectType) => {
  // const { open, close } = useAppKit();

  const onClickWalletConnect = async () => {
    const chainids = GetChainIds(props.network === 'mainnet' ? true : false, props.chainId);

    const connectNetwork = GetWalletConnectNetwork(chainids);

    if (!connectNetwork) {
      return;
    }

    console.log(111, connectNetwork);
    // Create the modal
    const appKit = createAppKit({
      adapters: [wagmiAdapter],
      projectId,
      // networks: [mainnet, arbitrum, avalanche, base, optimism, polygon],
      networks: [connectNetwork],
      defaultNetwork: connectNetwork,
      metadata: metadata,
      features: {
        analytics: false, // Optional - defaults to your Cloud configuration
        socials: [],
        email: false,
      },
      allWallets: 'HIDE',
    });

    if (appKit.getIsConnectedState()) {
      await appKit.switchNetwork(connectNetwork);
    } else {
      await appKit.open();
    }

    console.log(222, connectNetwork);
  };

  useEffect(() => {}, []);

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
