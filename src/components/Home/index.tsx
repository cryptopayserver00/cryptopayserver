import MetaTags from 'components/Common/MetaTags';
import HomeSidebar from 'components/Sidebar';
import { useRouter } from 'next/router';

import { Alert, AlertTitle, Box, Button, IconButton, Snackbar, Stack, Typography } from '@mui/material';
import Footer from './Footer';

import { useEffect, useState } from 'react';

import { useWalletPresistStore, useSnackPresistStore, useUserPresistStore, useStorePresistStore } from 'lib/store';

import ControlCameraIcon from '@mui/icons-material/ControlCamera';

import Link from 'next/link';
import { routes, RouteType } from './Routes';

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

  // const unLoginWhiteList: any = {
  //   '/': <Welcome />,
  //   '/login': <Login />,
  //   '/register': <Register />,
  // };

  // const storeCreationWhiteList: any = {
  //   '/stores/create': <CreateStore />,
  // };

  // const walletCreationWhiteList: any = {
  //   '/wallet/create': <CreateWallet />,
  //   '/wallet/import': <WalletImport />,
  //   '/wallet/import/mnemonicphrase': <ImportMnemonicPhraseOrPrivateKey />,
  //   '/wallet/generate': <GenerateWallet />,
  //   '/wallet/setPassword': <SetPassword />,
  //   '/wallet/phrase/intro': <PhraseIntro />,
  //   '/wallet/phrase/backup': <PhraseBackup />,
  //   '/wallet/phrase/backup/confirm': <PhraseBackupConfirm />,
  // };

  // const otherWhiteList: any = {
  //   '/wallets/bitcoin/send': <BitcoinSend />,
  //   '/wallets/bitcoin/receive': <BitcoinReceive />,
  //   '/wallets/ethereum/send': <EthereumSend />,
  //   '/wallets/ethereum/receive': <EthereumReceive />,
  //   '/wallets/solana/send': <SolanaSend />,
  //   '/wallets/solana/receive': <SolanaReceive />,
  //   '/wallets/bsc/send': <BscSend />,
  //   '/wallets/bsc/receive': <BscReceive />,
  //   '/wallets/litecoin/send': <LitecoinSend />,
  //   '/wallets/litecoin/receive': <LitecoinReceive />,
  //   '/wallets/tron/send': <TronSend />,
  //   '/wallets/tron/receive': <TronReceive />,
  //   '/wallets/ton/send': <TonSend />,
  //   '/wallets/ton/receive': <TonReceive />,
  //   '/invoices/[id]': <InvoicesDetails />,
  //   '/payment-requests/[id]': <PaymentRequestsDetails />,
  //   '/pull-payments/[id]': <PullPaymentsDetails />,
  //   '/freecoin': <FreeCoin />,
  // };

  // const pageList: any = {
  //   '/': <Welcome />,
  //   '/login': <Login />,
  //   '/register': <Register />,

  //   '/dashboard': <Dashboard />,
  //   '/settings': <Settings />,

  //   '/wallets/bitcoin': <Bitcoin />,
  //   '/wallets/bitcoin/send': <BitcoinSend />,
  //   '/wallets/bitcoin/receive': <BitcoinReceive />,
  //   '/wallets/bitcoin/lightning': <Lightning />,
  //   '/wallets/ethereum': <Ethereum />,
  //   '/wallets/ethereum/send': <EthereumSend />,
  //   '/wallets/ethereum/receive': <EthereumReceive />,
  //   '/wallets/solana': <Solana />,
  //   '/wallets/solana/send': <SolanaSend />,
  //   '/wallets/solana/receive': <SolanaReceive />,
  //   '/wallets/bsc': <Bsc />,
  //   '/wallets/bsc/send': <BscSend />,
  //   '/wallets/bsc/receive': <BscReceive />,
  //   '/wallets/litecoin': <Litecoin />,
  //   '/wallets/litecoin/send': <LitecoinSend />,
  //   '/wallets/litecoin/receive': <LitecoinReceive />,
  //   '/wallets/tron': <Tron />,
  //   '/wallets/tron/send': <TronSend />,
  //   '/wallets/tron/receive': <TronReceive />,
  //   '/wallets/ton': <Ton />,
  //   '/wallets/ton/send': <TonSend />,
  //   '/wallets/ton/receive': <TonReceive />,

  //   '/wallets/blockscan': <BlockScan />,
  //   '/payments/transactions': <PaymentTransactions />,
  //   '/payments/invoices': <PaymentInvoices />,
  //   '/payments/invoices/[id]': <PaymentInvoiceDetails />,
  //   '/payments/reporting': <Reporting />,
  //   '/payments/requests': <Requests />,
  //   '/payments/pullpayments': <Pullpayments />,
  //   '/payments/payouts': <Payouts />,
  //   '/plugins/shopify': <Shopify />,
  //   '/plugins/pointofsale': <Pointofsale />,
  //   '/plugins/paybutton': <Paybutton />,
  //   '/plugins/crowdfund': <Crowdfund />,
  //   '/account': <Account />,
  //   '/notifications': <Notifications />,

  //   '/stores/create': <CreateStore />,

  //   '/wallet/create': <CreateWallet />,
  //   '/wallet/import': <WalletImport />,
  //   '/wallet/import/mnemonicphrase': <ImportMnemonicPhraseOrPrivateKey />,
  //   '/wallet/generate': <GenerateWallet />,
  //   '/wallet/setPassword': <SetPassword />,
  //   '/wallet/phrase/intro': <PhraseIntro />,
  //   '/wallet/phrase/backup': <PhraseBackup />,
  //   '/wallet/phrase/backup/confirm': <PhraseBackupConfirm />,

  //   '/invoices/[id]': <InvoicesDetails />,
  //   '/payment-requests/[id]': <PaymentRequestsDetails />,
  //   '/pull-payments/[id]': <PullPaymentsDetails />,
  //   '/freecoin': <FreeCoin />,
  // };

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
    const route = routes.find((item) => item.path === router.pathname);

    if (!route) return;

    const loginStatus = getIsLogin();
    const storeStatus = getIsStore();
    const walletStatus = getIsWallet();

    setLogin(loginStatus);
    setStore(storeStatus);
    setWallet(walletStatus);

    if (route?.needLogin && !loginStatus) {
      window.location.href = '/login';
    }

    setCurrentRoute(route);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname, getIsLogin, getIsStore, getIsWallet]);

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
              {!isStore && (
                <Box mt={1}>
                  <Alert severity="warning">
                    <AlertTitle>Warning</AlertTitle>
                    <Typography>
                      You don't have a store yet. Please click&nbsp;
                      <Link href={'/stores/create'}>here</Link>
                      &nbsp;to create a new one.
                    </Typography>
                  </Alert>
                </Box>
              )}

              {!isWallet && (
                <Box mt={1}>
                  <Alert severity="warning">
                    <AlertTitle>Warning</AlertTitle>
                    <Typography>
                      You don't have a wallet yet. Please click&nbsp;
                      <Link href={'/wallet/create'}>here</Link>
                      &nbsp;to create a new one.
                    </Typography>
                  </Alert>
                </Box>
              )}

              {getNetwork() === 'testnet' && (
                <Box mt={1}>
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

              {currentRoute.component || null}
              {currentRoute?.enableInnerFooter && (
                <Box>
                  <Footer />
                </Box>
              )}
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

          {currentRoute?.component || null}
          {currentRoute?.enableInnerFooter && (
            <Box>
              <Footer />
            </Box>
          )}
        </Box>
      )}

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
