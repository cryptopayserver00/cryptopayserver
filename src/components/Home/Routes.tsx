import Dashboard from 'components/Dashboard';
import Settings from 'components/Settings';
import Bitcoin from 'components/Wallets/Bitcoin';
import Lightning from 'components/Wallets/Bitcoin/Lightning';
import Shopify from 'components/Plugins/Shopify';
import Pointofsale from 'components/Plugins/Pointofsale';
import Paybutton from 'components/Plugins/Paybutton';
import Crowdfund from 'components/Plugins/Crowdfund';
import Account from 'components/Account';
import Notifications from 'components/Notifications';
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
import ImportMnemonicPhraseOrPrivateKey from 'components/Wallet/Import/MnemonicPhraseOrPrivateKey';
import Ethereum from 'components/Wallets/Ethereum';
import Litecoin from 'components/Wallets/Litecoin';
import Solana from 'components/Wallets/Solana';
import Ton from 'components/Wallets/Ton';
import Tron from 'components/Wallets/Tron';
import Bsc from 'components/Wallets/Bsc';
import BitcoinSend from 'components/Wallets/Bitcoin/Send';
import BitcoinReceive from 'components/Wallets/Bitcoin/Receive';
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
import FreeCoin from 'components/FreeCoin';
import Welcome from 'components/Welcome';
import React from 'react';

export type RouteType = {
  path: string;
  name: string;
  title: string;
  component: any;
  enableSidebar: boolean;
  needLogin: boolean;
  enableInnerFooter: boolean;
};

export const routes: RouteType[] = [
  {
    path: '/',
    name: 'Home',
    title: 'Home',
    component: <Welcome />,
    enableSidebar: false,
    needLogin: false,
    enableInnerFooter: false,
  },
  {
    path: '/login',
    name: 'Login',
    title: 'Login',
    component: <Login />,
    enableSidebar: false,
    needLogin: false,
    enableInnerFooter: true,
  },
  {
    path: '/register',
    name: 'Register',
    title: 'Register',
    component: <Register />,
    enableSidebar: false,
    needLogin: false,
    enableInnerFooter: true,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    title: 'Dashboard',
    component: <Dashboard />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/settings',
    name: 'Settings',
    title: 'Settings',
    component: <Settings />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/bitcoin',
    name: 'Bitcoin',
    title: 'Bitcoin',
    component: <Bitcoin />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/bitcoin/send',
    name: 'BitcoinSend',
    title: 'BitcoinSend',
    component: <BitcoinSend />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/bitcoin/receive',
    name: 'BitcoinReceive',
    title: 'BitcoinReceive',
    component: <BitcoinReceive />,
    enableSidebar: false,
    needLogin: false,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/bitcoin/lightning',
    name: 'Lightning',
    title: 'Lightning',
    component: <Lightning />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/ethereum',
    name: 'Ethereum',
    title: 'Ethereum',
    component: <Ethereum />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/ethereum/send',
    name: 'EthereumSend',
    title: 'EthereumSend',
    component: <EthereumSend />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/ethereum/receive',
    name: 'EthereumReceive',
    title: 'EthereumReceive',
    component: <EthereumReceive />,
    enableSidebar: false,
    needLogin: false,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/solana',
    name: 'Solana',
    title: 'Solana',
    component: <Solana />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/solana/send',
    name: 'SolanaSend',
    title: 'SolanaSend',
    component: <SolanaSend />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/solana/receive',
    name: 'SolanaReceive',
    title: 'SolanaReceive',
    component: <SolanaReceive />,
    enableSidebar: false,
    needLogin: false,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/bsc',
    name: 'Bsc',
    title: 'Bsc',
    component: <Bsc />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/bsc/send',
    name: 'BscSend',
    title: 'BscSend',
    component: <BscSend />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/bsc/receive',
    name: 'BscReceive',
    title: 'BscReceive',
    component: <BscReceive />,
    enableSidebar: false,
    needLogin: false,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/litecoin',
    name: 'Litecoin',
    title: 'Litecoin',
    component: <Litecoin />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/litecoin/send',
    name: 'LitecoinSend',
    title: 'LitecoinSend',
    component: <LitecoinSend />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/litecoin/receive',
    name: 'LitecoinReceive',
    title: 'LitecoinReceive',
    component: <LitecoinReceive />,
    enableSidebar: false,
    needLogin: false,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/tron',
    name: 'Tron',
    title: 'Tron',
    component: <Tron />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/tron/send',
    name: 'TronSend',
    title: 'TronSend',
    component: <TronSend />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/tron/receive',
    name: 'TronReceive',
    title: 'TronReceive',
    component: <TronReceive />,
    enableSidebar: false,
    needLogin: false,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/ton',
    name: 'Ton',
    title: 'Ton',
    component: <Ton />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/ton/send',
    name: 'TonSend',
    title: 'TonSend',
    component: <TonSend />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/ton/receive',
    name: 'TonReceive',
    title: 'TonReceive',
    component: <TonReceive />,
    enableSidebar: false,
    needLogin: false,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/blockscan',
    name: 'BlockScan',
    title: 'BlockScan',
    component: <BlockScan />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/payments/transactions',
    name: 'PaymentTransactions',
    title: 'PaymentTransactions',
    component: <PaymentTransactions />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/payments/invoices',
    name: 'PaymentInvoices',
    title: 'PaymentInvoices',
    component: <PaymentInvoices />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/payments/invoices/[id]',
    name: 'PaymentInvoiceDetails',
    title: 'PaymentInvoiceDetails',
    component: <PaymentInvoiceDetails />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/payments/reporting',
    name: 'Reporting',
    title: 'Reporting',
    component: <Reporting />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/payments/requests',
    name: 'Requests',
    title: 'Requests',
    component: <Requests />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/payments/pullpayments',
    name: 'Pullpayments',
    title: 'Pullpayments',
    component: <Pullpayments />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/payments/payouts',
    name: 'Payouts',
    title: 'Payouts',
    component: <Payouts />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/plugins/shopify',
    name: 'Shopify',
    title: 'Shopify',
    component: <Shopify />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/plugins/pointofsale',
    name: 'Pointofsale',
    title: 'Pointofsale',
    component: <Pointofsale />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/plugins/paybutton',
    name: 'Paybutton',
    title: 'Paybutton',
    component: <Paybutton />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/plugins/crowdfund',
    name: 'Crowdfund',
    title: 'Crowdfund',
    component: <Crowdfund />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/account',
    name: 'Account',
    title: 'Account',
    component: <Account />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/notifications',
    name: 'Notifications',
    title: 'Notifications',
    component: <Notifications />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/stores/create',
    name: 'CreateStore',
    title: 'CreateStore',
    component: <CreateStore />,
    enableSidebar: false,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallet/create',
    name: 'CreateWallet',
    title: 'CreateWallet',
    component: <CreateWallet />,
    enableSidebar: false,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallet/import',
    name: 'WalletImport',
    title: 'WalletImport',
    component: <WalletImport />,
    enableSidebar: false,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallet/import/mnemonicphrase',
    name: 'ImportMnemonicPhraseOrPrivateKey',
    title: 'ImportMnemonicPhraseOrPrivateKey',
    component: <ImportMnemonicPhraseOrPrivateKey />,
    enableSidebar: false,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallet/generate',
    name: 'GenerateWallet',
    title: 'GenerateWallet',
    component: <GenerateWallet />,
    enableSidebar: false,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallet/setPassword',
    name: 'SetPassword',
    title: 'SetPassword',
    component: <SetPassword />,
    enableSidebar: false,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallet/phrase/intro',
    name: 'PhraseIntro',
    title: 'PhraseIntro',
    component: <PhraseIntro />,
    enableSidebar: false,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallet/phrase/backup',
    name: 'PhraseBackup',
    title: 'PhraseBackup',
    component: <PhraseBackup />,
    enableSidebar: false,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallet/phrase/backup/confirm',
    name: 'PhraseBackupConfirm',
    title: 'PhraseBackupConfirm',
    component: <PhraseBackupConfirm />,
    enableSidebar: false,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/invoices/[id]',
    name: 'InvoicesDetails',
    title: 'InvoicesDetails',
    component: <InvoicesDetails />,
    enableSidebar: false,
    needLogin: false,
    enableInnerFooter: true,
  },
  {
    path: '/payment-requests/[id]',
    name: 'PaymentRequestsDetails',
    title: 'PaymentRequestsDetails',
    component: <PaymentRequestsDetails />,
    enableSidebar: false,
    needLogin: false,
    enableInnerFooter: true,
  },
  {
    path: '/pull-payments/[id]',
    name: 'PullPaymentsDetails',
    title: 'PullPaymentsDetails',
    component: <PullPaymentsDetails />,
    enableSidebar: false,
    needLogin: false,
    enableInnerFooter: true,
  },
  {
    path: '/freecoin',
    name: 'FreeCoin',
    title: 'FreeCoin',
    component: <FreeCoin />,
    enableSidebar: false,
    needLogin: false,
    enableInnerFooter: true,
  },
];
