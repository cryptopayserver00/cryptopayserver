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
import ForgotPassword from 'components/ForgotPassword';
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
import InvoicesDetails from 'components/Invoices/id';
import BlockScan from 'components/Wallets/BlockScan';
import Security from 'components/Wallets/Security';
import WalletsReceive from 'components/Wallets/Receive';
import WalletsSend from 'components/Wallets/Send';
import SolanaSend from 'components/Wallets/Solana/Send';
import LitecoinSend from 'components/Wallets/Litecoin/Send';
import TronSend from 'components/Wallets/Tron/Send';
import TonSend from 'components/Wallets/Ton/Send';
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
import XRP from 'components/Wallets/Xrp';
import XrpSend from 'components/Wallets/Xrp/Send';
import BitcoinCash from 'components/Wallets/BitcoinCash';
import BitcoinCashSend from 'components/Wallets/BitcoinCash/Send';
import Arbitrum from 'components/Wallets/Arbitrum';
import ArbitrumNova from 'components/Wallets/ArbitrumNova';
import Avalanche from 'components/Wallets/Avalanche';
import Polygon from 'components/Wallets/Polygon';
import Base from 'components/Wallets/Base';
import Optimism from 'components/Wallets/Optimism';
import SecurityPassword from 'components/Wallets/Security/Password';
import SecurityPrivateKey from 'components/Wallets/Security/PrivateKey';
import SecurityAudit from 'components/Wallets/Security/Audit';
import SecurityWallet from 'components/Wallets/Security/Wallet';
import SecurityNetwork from 'components/Wallets/Security/Network';
import SecurityAddressBook from 'components/Wallets/Security/AddressBook';

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
    path: '/forgot-password',
    name: 'ForgotPassword',
    title: 'ForgotPassword',
    component: <ForgotPassword />,
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
    path: '/wallets/send',
    name: 'WalletsSend',
    title: 'WalletsSend',
    component: <WalletsSend />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/receive',
    name: 'WalletsReceive',
    title: 'WalletsReceive',
    component: <WalletsReceive />,
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
    path: '/wallets/bsc',
    name: 'Bsc',
    title: 'Bsc',
    component: <Bsc />,
    enableSidebar: true,
    needLogin: true,
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
    path: '/wallets/xrp',
    name: 'Xrp',
    title: 'Xrp',
    component: <XRP />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/xrp/send',
    name: 'XrpSend',
    title: 'XrpSend',
    component: <XrpSend />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/bitcoincash',
    name: 'BitcoinCash',
    title: 'BitcoinCash',
    component: <BitcoinCash />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/bitcoincash/send',
    name: 'BitcoinCashSend',
    title: 'BitcoinCashSend',
    component: <BitcoinCashSend />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/arbitrum',
    name: 'Arbitrum',
    title: 'Arbitrum',
    component: <Arbitrum />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/arbitrumnova',
    name: 'ArbitrumNova',
    title: 'ArbitrumNova',
    component: <ArbitrumNova />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/avalanche',
    name: 'Avalanche',
    title: 'Avalanche',
    component: <Avalanche />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/polygon',
    name: 'Polygon',
    title: 'Polygon',
    component: <Polygon />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/base',
    name: 'Base',
    title: 'Base',
    component: <Base />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/optimism',
    name: 'Optimism',
    title: 'Optimism',
    component: <Optimism />,
    enableSidebar: true,
    needLogin: true,
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
    path: '/wallets/security',
    name: 'Security',
    title: 'Security',
    component: <Security />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/security/password',
    name: 'SecurityPassword',
    title: 'SecurityPassword',
    component: <SecurityPassword />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/security/privatekey',
    name: 'SecurityPrivateKey',
    title: 'SecurityPrivateKey',
    component: <SecurityPrivateKey />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/security/audit',
    name: 'SecurityAudit',
    title: 'SecurityAudit',
    component: <SecurityAudit />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/security/wallet',
    name: 'SecurityWallet',
    title: 'SecurityWallet',
    component: <SecurityWallet />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/security/network',
    name: 'SecurityNetwork',
    title: 'SecurityNetwork',
    component: <SecurityNetwork />,
    enableSidebar: true,
    needLogin: true,
    enableInnerFooter: true,
  },
  {
    path: '/wallets/security/addressbook',
    name: 'SecurityAddressBook',
    title: 'SecurityAddressBook',
    component: <SecurityAddressBook />,
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
