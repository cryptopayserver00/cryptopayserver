import MetaTags from 'components/Common/MetaTags';
import HomeSidebar from 'components/Sidebar';
import { useRouter } from 'next/router';
import Dashboard from 'components/Dashboard';
import Settings from 'components/Settings';
import Bitcoin from 'components/Wallets/Bitcoin';
import Lightning from 'components/Wallets/Bitcoin/Lightning';
import Shopify from 'components/Plugins/Shopify';
import Pointofsale from 'components/Plugins/Pointofsale';
import Paybutton from 'components/Plugins/Paybutton';
import Crowdfund from 'components/Plugins/Crowdfund';
import { Alert, AlertTitle, Box, Button, IconButton, Snackbar, Stack, Typography } from '@mui/material';
import Footer from './Footer';
import Account from 'components/Account';
import Notifications from 'components/Notifications';
import { useEffect, useState } from 'react';
import Login from 'components/Login';
import Register from 'components/Register';
import CreateStore from 'components/Stores/Create';
import CreateWallet from 'components/Wallet/Create';
import WalletImport from 'components/Wallet/Import';
import GenerateWallet from 'components/Wallet/Generate';
import SetPassword from 'components/Wallet/SetPassword';
import PhraseIntro from 'components/Wallet/Phrase/Intro';
import PhraseBackup from 'components/Wallet/Phrase/Backup';
import PhraseBackupConfirm from 'components/Wallet/Phrase/Backup/Confirm';
import { useWalletPresistStore, useSnackPresistStore, useUserPresistStore, useStorePresistStore } from 'lib/store';
import ImportMnemonicPhraseOrPrivateKey from 'components/Wallet/Import/MnemonicPhraseOrPrivateKey';
import Ethereum from 'components/Wallets/Ethereum';
import Litecoin from 'components/Wallets/Litecoin';
import Solana from 'components/Wallets/Solana';
import Ton from 'components/Wallets/Ton';
import Tron from 'components/Wallets/Tron';
import Bsc from 'components/Wallets/Bsc';
import BitcoinSend from 'components/Wallets/Bitcoin/Send';
import BitcoinReceive from 'components/Wallets/Bitcoin/Receive';
import ControlCameraIcon from '@mui/icons-material/ControlCamera';
// import Invoices from 'components/Invoices/index';
import InvoicesDetails from 'components/Invoices/id';
import BlockScan from 'components/Wallets/BlockScan';
import EthereumSend from 'components/Wallets/Ethereum/Send';
import EthereumReceive from 'components/Wallets/Ethereum/Receive';
import SolanaSend from 'components/Wallets/Solana/Send';
import SolanaReceive from 'components/Wallets/Solana/Receive';
import BscSend from 'components/Wallets/Bsc/Send';
import BscReceive from 'components/Wallets/Bsc/Receive';
import LitecoinSend from 'components/Wallets/Litecoin/Send';
import LitecoinReceive from 'components/Wallets/Litecoin/Receive';
import TronSend from 'components/Wallets/Tron/Send';
import TronReceive from 'components/Wallets/Tron/Receive';
import TonSend from 'components/Wallets/Ton/Send';
import TonReceive from 'components/Wallets/Ton/Receive';
import PaymentTransactions from 'components/Payments/Transactions';
import PaymentInvoices from 'components/Payments/Invoices';
import PaymentInvoiceDetails from 'components/Payments/Invoices/id';
import Reporting from 'components/Payments/Reporting';
import Requests from 'components/Payments/Requests';
import Pullpayments from 'components/Payments/Pullpayments';
import Payouts from 'components/Payments/Payouts';
import PaymentRequestsDetails from 'components/PaymentRequests/id';
import PullPaymentsDetails from 'components/PullPayments/id';
import Link from 'next/link';
import FreeCoin from 'components/FreeCoin';
import Welcome from 'components/Welcome';

type RouteType = {
  path: string;
  name: string;
  title: string;
  component: any;
  enableSidebar: boolean;
};

const Home = () => {
  const router = useRouter();

  const { snackOpen, snackMessage, snackSeverity, setSnackOpen } = useSnackPresistStore((state) => state);
  const { getIsLogin, resetUser, getNetwork, setShowSidebar, getShowSidebar } = useUserPresistStore((state) => state);
  const { getIsWallet, resetWallet } = useWalletPresistStore((state) => state);
  const { resetStore, getIsStore } = useStorePresistStore((state) => state);

  const [isLogin, setLogin] = useState<boolean>(false);
  const [isStore, setStore] = useState<boolean>(false);
  const [isWallet, setWallet] = useState<boolean>(false);
  const [currentRoute, setCurrentRoute] = useState<RouteType>();

  const routes: RouteType[] = [
    {
      path: '/',
      name: 'Home',
      title: 'Home',
      component: <Welcome />,
      enableSidebar: false,
    },
    {
      path: '/login',
      name: 'Login',
      title: 'Login',
      component: <Login />,
      enableSidebar: false,
    },
    {
      path: '/register',
      name: 'Register',
      title: 'Register',
      component: <Register />,
      enableSidebar: false,
    },
  ];

  const unLoginWhiteList: any = {
    '/': <Welcome />,
    '/login': <Login />,
    '/register': <Register />,
  };

  const storeCreationWhiteList: any = {
    '/stores/create': <CreateStore />,
  };

  const walletCreationWhiteList: any = {
    '/wallet/create': <CreateWallet />,
    '/wallet/import': <WalletImport />,
    '/wallet/import/mnemonicphrase': <ImportMnemonicPhraseOrPrivateKey />,
    '/wallet/generate': <GenerateWallet />,
    '/wallet/setPassword': <SetPassword />,
    '/wallet/phrase/intro': <PhraseIntro />,
    '/wallet/phrase/backup': <PhraseBackup />,
    '/wallet/phrase/backup/confirm': <PhraseBackupConfirm />,
  };

  const otherWhiteList: any = {
    '/wallets/bitcoin/send': <BitcoinSend />,
    '/wallets/bitcoin/receive': <BitcoinReceive />,
    '/wallets/ethereum/send': <EthereumSend />,
    '/wallets/ethereum/receive': <EthereumReceive />,
    '/wallets/solana/send': <SolanaSend />,
    '/wallets/solana/receive': <SolanaReceive />,
    '/wallets/bsc/send': <BscSend />,
    '/wallets/bsc/receive': <BscReceive />,
    '/wallets/litecoin/send': <LitecoinSend />,
    '/wallets/litecoin/receive': <LitecoinReceive />,
    '/wallets/tron/send': <TronSend />,
    '/wallets/tron/receive': <TronReceive />,
    '/wallets/ton/send': <TonSend />,
    '/wallets/ton/receive': <TonReceive />,
    '/invoices/[id]': <InvoicesDetails />,
    '/payment-requests/[id]': <PaymentRequestsDetails />,
    '/pull-payments/[id]': <PullPaymentsDetails />,
    '/freecoin': <FreeCoin />,
  };

  const pageList: any = {
    '/': <Welcome />,
    '/login': <Login />,
    '/register': <Register />,

    '/dashboard': <Dashboard />,
    '/settings': <Settings />,
    '/wallets/bitcoin': <Bitcoin />,
    '/wallets/bitcoin/send': <BitcoinSend />,
    '/wallets/bitcoin/receive': <BitcoinReceive />,
    '/wallets/bitcoin/lightning': <Lightning />,
    '/wallets/ethereum': <Ethereum />,
    '/wallets/ethereum/send': <EthereumSend />,
    '/wallets/ethereum/receive': <EthereumReceive />,
    '/wallets/litecoin': <Litecoin />,
    '/wallets/solana': <Solana />,
    '/wallets/solana/send': <SolanaSend />,
    '/wallets/solana/receive': <SolanaReceive />,
    '/wallets/bsc/send': <BscSend />,
    '/wallets/bsc/receive': <BscReceive />,
    '/wallets/litecoin/send': <LitecoinSend />,
    '/wallets/litecoin/receive': <LitecoinReceive />,
    '/wallets/tron/send': <TronSend />,
    '/wallets/tron/receive': <TronReceive />,
    '/wallets/ton/send': <TonSend />,
    '/wallets/ton/receive': <TonReceive />,
    '/wallets/ton': <Ton />,
    '/wallets/tron': <Tron />,
    '/wallets/bsc': <Bsc />,
    '/wallets/blockscan': <BlockScan />,
    '/payments/transactions': <PaymentTransactions />,
    '/payments/invoices': <PaymentInvoices />,
    '/payments/invoices/[id]': <PaymentInvoiceDetails />,
    '/payments/reporting': <Reporting />,
    '/payments/requests': <Requests />,
    '/payments/pullpayments': <Pullpayments />,
    '/payments/payouts': <Payouts />,
    '/plugins/shopify': <Shopify />,
    '/plugins/pointofsale': <Pointofsale />,
    '/plugins/paybutton': <Paybutton />,
    '/plugins/crowdfund': <Crowdfund />,
    '/account': <Account />,
    '/notifications': <Notifications />,

    '/stores/create': <CreateStore />,

    '/wallet/create': <CreateWallet />,
    '/wallet/import': <WalletImport />,
    '/wallet/import/mnemonicphrase': <ImportMnemonicPhraseOrPrivateKey />,
    '/wallet/generate': <GenerateWallet />,
    '/wallet/setPassword': <SetPassword />,
    '/wallet/phrase/intro': <PhraseIntro />,
    '/wallet/phrase/backup': <PhraseBackup />,
    '/wallet/phrase/backup/confirm': <PhraseBackupConfirm />,

    '/invoices/[id]': <InvoicesDetails />,
    '/payment-requests/[id]': <PaymentRequestsDetails />,
    '/pull-payments/[id]': <PullPaymentsDetails />,
    '/freecoin': <FreeCoin />,
  };

  // useEffect(() => {
  //   const checkState = async () => {
  //     const loginStatus = getIsLogin();
  //     const storeStatus = getIsStore();
  //     const walletStatus = getIsWallet();

  //     setLogin(loginStatus);
  //     setStore(storeStatus);
  //     setWallet(walletStatus);

  //     if (!loginStatus) {
  //       if (unLoginWhiteList[router.pathname]) {
  //         return;
  //       } else {
  //         window.location.href = '/login';
  //       }
  //     } else if (!storeStatus) {
  //       if (storeCreationWhiteList[router.pathname]) {
  //         return;
  //       } else {
  //         window.location.href = '/stores/create';
  //       }
  //     } else if (!walletStatus) {
  //       if (walletCreationWhiteList[router.pathname]) {
  //         return;
  //       } else {
  //         window.location.href = '/wallet/create';
  //       }
  //     } else {
  //       if (router.pathname === '/') {
  //         window.location.href = '/dashboard';
  //       } else if (!dashboardWhiteList[router.pathname]) {
  //         window.location.href = '/';
  //       }
  //     }
  //   };

  //   checkState();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [router.pathname, getIsLogin, getIsStore, getIsWallet]);

  useEffect(() => {
    setCurrentRoute(routes.find((item) => item.path === router.pathname));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname, routes]);

  return (
    <Box height={'100%'}>
      <MetaTags title={currentRoute?.title} />

      {currentRoute?.enableSidebar ? (
        <Stack direction={'row'} height={'100%'}>
          {getShowSidebar() ? <HomeSidebar /> : null}

          <Box width={'100%'}>
            <Box m={2}>
              <IconButton
                onClick={() => {
                  setShowSidebar(!getShowSidebar());
                }}
              >
                <ControlCameraIcon />
              </IconButton>
            </Box>

            <Box>
              {getNetwork() === 'testnet' && (
                <Box>
                  <Alert severity="warning">
                    <AlertTitle>Warning</AlertTitle>
                    <Typography>
                      This is a test network, and the currency has no real value. If you need free coins, you can get
                      them&nbsp;
                      <Link href={'/freecoin'} target="_blank">
                        here.
                      </Link>
                    </Typography>
                  </Alert>
                </Box>
              )}

              {pageList[router.pathname] || null}
              <Box>
                <Footer />
              </Box>
            </Box>
          </Box>
        </Stack>
      ) : (
        <Box>
          {getNetwork() === 'testnet' && (
            <Box>
              <Alert severity="warning">
                <AlertTitle>Warning</AlertTitle>
                <Typography>
                  This is a test network, and the currency has no real value. If you need free coins, you can get
                  them&nbsp;
                  <Link href={'/freecoin'} target="_blank">
                    here.
                  </Link>
                </Typography>
              </Alert>
            </Box>
          )}

          {pageList[router.pathname] || null}
          <Box>
            <Footer />
          </Box>
        </Box>
      )}

      {/* <Box width={'100%'}>
        {unLoginWhiteList[router.pathname] || null}
        <Box>
          <Footer />
        </Box>
      </Box> */}

      {/* {isLogin && (
        <Stack direction={'row'} height={'100%'}>
          {storeCreationWhiteList[router.pathname] ||
          walletCreationWhiteList[router.pathname] ||
          otherWhiteList[router.pathname] ? null : getShowSidebar() ? (
            <HomeSidebar />
          ) : null}

          <Box width={'100%'}>
            {dashboardWhiteList[router.pathname] ? (
              <Box m={2}>
                <IconButton
                  onClick={() => {
                    setShowSidebar(!getShowSidebar());
                  }}
                >
                  <ControlCameraIcon />
                </IconButton>
              </Box>
            ) : null}

            <Box>
              {getNetwork() === 'testnet' && (
                <Box>
                  <Alert severity="warning">
                    <AlertTitle>Warning</AlertTitle>
                    <Typography>
                      This is a test network, and the currency has no real value. If you need free coins, you can get
                      them&nbsp;
                      <Link href={'/freecoin'} target="_blank">
                        here.
                      </Link>
                    </Typography>
                  </Alert>
                </Box>
              )}

              {dashboardWhiteList[router.pathname] || null}
              <Box>
                <Footer />
              </Box>
            </Box>
          </Box>
        </Stack>
      )}

      {!isLogin && (
        <Box width={'100%'}>
          {unLoginWhiteList[router.pathname] || null}
          <Box>
            <Footer />
          </Box>
        </Box>
      )} */}

      <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'right' }} open={snackOpen}>
        <Alert
          onClose={() => {
            setSnackOpen(false);
          }}
          severity={snackSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Home;
