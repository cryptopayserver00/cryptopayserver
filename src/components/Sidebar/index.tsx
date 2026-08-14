import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { SidebarFooter } from './SidebarFooter'
import { SidebarHeader } from './SidebarHeader'
import {
  LayoutDashboard,
  Settings,
  DollarSign,
  Shield,
  CreditCard,
  FileText,
  BarChart2,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Blocks,
  ShoppingBag,
  Store as StoreIcon,
  CircleDot,
  Users,
  ChevronDown,
} from 'lucide-react'

import BitcoinSVG from '@/assets/chain/bitcoin.svg'
import EthereumSVG from '@/assets/chain/ethereum.svg'
import BscSVG from '@/assets/chain/bsc.svg'
import LitecoinSVG from '@/assets/chain/litecoin.svg'
import XrpSVG from '@/assets/chain/xrp.svg'
import BitcoinCashSVG from '@/assets/chain/bitcoincash.svg'
import ArbitrumSVG from '@/assets/chain/arbitrum.svg'
import ArbitrumNovaSVG from '@/assets/chain/arbitrumnova.svg'
import AvalancheSVG from '@/assets/chain/avalanche.svg'
import PolygonSVG from '@/assets/chain/polygon.svg'
import BaseSVG from '@/assets/chain/base.svg'
import OptimismSVG from '@/assets/chain/optimism.svg'
import SolanaSVG from '@/assets/chain/solana.svg'
import TonSVG from '@/assets/chain/ton.svg'
import TronSVG from '@/assets/chain/tron.svg'
import { useStorePresistStore, useUserPresistStore, useWalletPresistStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'

type HomeSidebarProps = {
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
}

type NavItemProps = {
  href: string
  icon: React.ReactNode
  label: string
  active: boolean
  collapsed: boolean
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label, active, collapsed }) => (
  <Link
    href={href}
    className={`flex items-center gap-3 px-3 py-2 text-xs transition-colors rounded-md ${
      active
        ? 'bg-blue-50 text-[#0098e5] font-semibold'
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
    } ${collapsed ? 'justify-center px-2' : ''}`}
    title={collapsed ? label : undefined}
  >
    <span className="shrink-0">{icon}</span>
    {!collapsed && <span className="truncate">{label}</span>}
  </Link>
)

const HomeSidebar = ({ collapsed }: HomeSidebarProps) => {
  const router = useRouter()

  const [paymentsOpen, setPaymentsOpen] = useState(router.pathname.includes('/payments'))
  const [pluginsOpen, setPluginsOpen] = useState(router.pathname.includes('/plugins'))

  const { sidebarCollapsed, network } = useUserPresistStore(
    useShallow((state) => ({
      sidebarCollapsed: state.sidebarCollapsed,
      network: state.network,
    }))
  )

  const { isWallet } = useWalletPresistStore(
    useShallow((state) => ({
      isWallet: state.isWallet,
    }))
  )

  const { isStore } = useStorePresistStore(
    useShallow((state) => ({
      isStore: state.isStore,
    }))
  )

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-30 transition-all duration-300 ${
        collapsed ? 'w-[80px]' : 'w-[250px]'
      }`}
    >
      <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden py-6">
        <SidebarHeader className="mb-4" />

        <nav className="flex-1 px-3 space-y-1">
          <NavItem
            href="/dashboard"
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            active={router.pathname === '/dashboard'}
            collapsed={collapsed}
          />

          {isStore && isWallet && (
            <>
              <NavItem
                href="/settings"
                icon={<Settings size={18} />}
                label="Store Settings"
                active={router.pathname === '/settings'}
                collapsed={collapsed}
              />
              <NavItem
                href="/account"
                icon={<Settings size={18} />}
                label="Account Settings"
                active={router.pathname === '/account'}
                collapsed={collapsed}
              />

              <div className="pt-6 pb-2 px-3">
                <p
                  className={`text-[10px] font-semibold text-gray-400 uppercase tracking-wider ${collapsed ? 'hidden' : 'block'}`}
                >
                  WALLETS
                </p>
              </div>

              <NavItem
                href="/wallets/assets"
                icon={<DollarSign size={18} />}
                label="My Assets"
                active={router.pathname === '/wallets/assets'}
                collapsed={collapsed}
              />
              <NavItem
                href="/wallets/manage"
                icon={<Shield size={18} />}
                label="Wallet Management"
                active={router.pathname === '/wallets/manage'}
                collapsed={collapsed}
              />
              <NavItem
                href="/wallets/bitcoin"
                icon={
                  <Image src={BitcoinSVG} alt="icon" width={18} height={18} className="h-5 w-5" />
                }
                label="Bitcoin"
                active={router.pathname === '/wallets/bitcoin'}
                collapsed={collapsed}
              />
              <NavItem
                href="/wallets/bitcoin/lightning"
                icon={
                  <Image src={BitcoinSVG} alt="icon" width={18} height={18} className="h-5 w-5" />
                }
                label="Lightning"
                active={router.pathname === '/wallets/bitcoin/lightning'}
                collapsed={collapsed}
              />
              <NavItem
                href="/wallets/litecoin"
                icon={
                  <Image src={LitecoinSVG} alt="icon" width={18} height={18} className="h-5 w-5" />
                }
                label="Litecoin"
                active={router.pathname === '/wallets/litecoin'}
                collapsed={collapsed}
              />
              <NavItem
                href="/wallets/xrp"
                icon={<Image src={XrpSVG} alt="icon" width={18} height={18} className="w-5 h-5" />}
                label="Xrp"
                active={router.pathname === '/wallets/xrp'}
                collapsed={collapsed}
              />
              <NavItem
                href="/wallets/bitcoincash"
                icon={
                  <Image
                    src={BitcoinCashSVG}
                    alt="icon"
                    width={18}
                    height={18}
                    className="h-5 w-5"
                  />
                }
                label="Bitcoin Cash"
                active={router.pathname === '/wallets/bitcoincash'}
                collapsed={collapsed}
              />
              <NavItem
                href="/wallets/ethereum"
                icon={
                  <Image src={EthereumSVG} alt="icon" width={18} height={18} className="h-5 w-5" />
                }
                label="Ethereum"
                active={router.pathname === '/wallets/ethereum'}
                collapsed={collapsed}
              />
              <NavItem
                href="/wallets/tron"
                icon={<Image src={TronSVG} alt="icon" width={18} height={18} className="h-5 w-5" />}
                label="Tron"
                active={router.pathname === '/wallets/tron'}
                collapsed={collapsed}
              />
              <NavItem
                href="/wallets/solana"
                icon={
                  <Image src={SolanaSVG} alt="icon" width={18} height={18} className="h-5 w-5" />
                }
                label="Solana"
                active={router.pathname === '/wallets/solana'}
                collapsed={collapsed}
              />
              <NavItem
                href="/wallets/bsc"
                icon={<Image src={BscSVG} alt="icon" width={18} height={18} className="h-5 w-5" />}
                label="Binance Smart Chain"
                active={router.pathname === '/wallets/bsc'}
                collapsed={collapsed}
              />
              <NavItem
                href="/wallets/arbitrum"
                icon={
                  <Image src={ArbitrumSVG} alt="icon" width={18} height={18} className="h-5 w-5" />
                }
                label="Arbitrum"
                active={router.pathname === '/wallets/arbitrum'}
                collapsed={collapsed}
              />
              {network === 'mainnet' && (
                <NavItem
                  href="/wallets/arbitrumnova"
                  icon={
                    <Image
                      src={ArbitrumNovaSVG}
                      alt="icon"
                      width={18}
                      height={18}
                      className="h-5 w-5"
                    />
                  }
                  label="Arbitrum Nova"
                  active={router.pathname === '/wallets/arbitrumnova'}
                  collapsed={collapsed}
                />
              )}
              <NavItem
                href="/wallets/avalanche"
                icon={
                  <Image src={AvalancheSVG} alt="icon" width={18} height={18} className="h-5 w-5" />
                }
                label="Avalanche"
                active={router.pathname === '/wallets/avalanche'}
                collapsed={collapsed}
              />
              <NavItem
                href="/wallets/polygon"
                icon={
                  <Image src={PolygonSVG} alt="icon" width={18} height={18} className="h-5 w-5" />
                }
                label="Polygon"
                active={router.pathname === '/wallets/polygon'}
                collapsed={collapsed}
              />
              <NavItem
                href="/wallets/base"
                icon={<Image src={BaseSVG} alt="icon" width={18} height={18} className="h-5 w-5" />}
                label="Base"
                active={router.pathname === '/wallets/base'}
                collapsed={collapsed}
              />
              <NavItem
                href="/wallets/optimism"
                icon={
                  <Image src={OptimismSVG} alt="icon" width={18} height={18} className="h-5 w-5" />
                }
                label="Optimism"
                active={router.pathname === '/wallets/optimism'}
                collapsed={collapsed}
              />
              <NavItem
                href="/wallets/ton"
                icon={<Image src={TonSVG} alt="icon" width={18} height={18} className="h-5 w-5" />}
                label="Ton"
                active={router.pathname === '/wallets/ton'}
                collapsed={collapsed}
              />

              <div className="pt-6 pb-2 px-3">
                <p
                  className={`text-[10px] font-semibold text-gray-400 uppercase tracking-wider ${collapsed ? 'hidden' : 'block'}`}
                >
                  PAYMENTS
                </p>
              </div>

              <div>
                <button
                  onClick={() => setPaymentsOpen(!paymentsOpen)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors rounded-md text-gray-700 hover:bg-gray-100 ${
                    router.pathname.includes('/payments') ? 'text-[#0098e5] font-semibold' : ''
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard size={18} />
                    {!collapsed && <span>PAYMENTS</span>}
                  </div>
                  {!collapsed && (
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${paymentsOpen ? 'rotate-180' : ''}`}
                    />
                  )}
                </button>

                {(paymentsOpen || collapsed) && (
                  <div className={`space-y-1 mt-1 ${collapsed ? '' : 'pl-4'}`}>
                    <NavItem
                      href="/payments/transactions"
                      icon={<FileText size={18} />}
                      label="Transactions"
                      active={router.pathname === '/payments/transactions'}
                      collapsed={collapsed}
                    />
                    <NavItem
                      href="/payments/invoices"
                      icon={<FileText size={18} />}
                      label="Invoices"
                      active={router.pathname === '/payments/invoices'}
                      collapsed={collapsed}
                    />
                    <NavItem
                      href="/payments/reporting"
                      icon={<BarChart2 size={18} />}
                      label="Reporting"
                      active={router.pathname === '/payments/reporting'}
                      collapsed={collapsed}
                    />
                    <NavItem
                      href="/payments/requests"
                      icon={<ArrowDownLeft size={18} />}
                      label="Requests"
                      active={router.pathname === '/payments/requests'}
                      collapsed={collapsed}
                    />
                    <NavItem
                      href="/payments/pullpayments"
                      icon={<ArrowUpRight size={18} />}
                      label="Pull Payments"
                      active={router.pathname === '/payments/pullpayments'}
                      collapsed={collapsed}
                    />
                    <NavItem
                      href="/payments/payouts"
                      icon={<Receipt size={18} />}
                      label="Payouts"
                      active={router.pathname === '/payments/payouts'}
                      collapsed={collapsed}
                    />
                  </div>
                )}
              </div>

              <div className="pt-6 pb-2 px-3">
                <p
                  className={`text-[10px] font-semibold text-gray-400 uppercase tracking-wider ${collapsed ? 'hidden' : 'block'}`}
                >
                  PLUGINS
                </p>
              </div>

              <div>
                <button
                  onClick={() => setPluginsOpen(!pluginsOpen)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors rounded-md text-gray-700 hover:bg-gray-100 ${
                    router.pathname.includes('/plugins') ? 'text-[#0098e5] font-semibold' : ''
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <Blocks size={18} />
                    {!collapsed && <span>PLUGINS</span>}
                  </div>
                  {!collapsed && (
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${pluginsOpen ? 'rotate-180' : ''}`}
                    />
                  )}
                </button>

                {(pluginsOpen || collapsed) && (
                  <div className={`space-y-1 mt-1 ${collapsed ? '' : 'pl-4'}`}>
                    <NavItem
                      href="/plugins/shopify"
                      icon={<ShoppingBag size={18} />}
                      label="Shopify"
                      active={router.pathname === '/plugins/shopify'}
                      collapsed={collapsed}
                    />
                    <NavItem
                      href="/plugins/pointofsale"
                      icon={<StoreIcon size={18} />}
                      label="Point of Sale"
                      active={router.pathname === '/plugins/pointofsale'}
                      collapsed={collapsed}
                    />
                    <NavItem
                      href="/plugins/paybutton"
                      icon={<CircleDot size={18} />}
                      label="Pay Button"
                      active={router.pathname === '/plugins/paybutton'}
                      collapsed={collapsed}
                    />
                    <NavItem
                      href="/plugins/crowdfund"
                      icon={<Users size={18} />}
                      label="Crowdfund"
                      active={router.pathname === '/plugins/crowdfund'}
                      collapsed={collapsed}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </nav>

        <SidebarFooter collapsed={collapsed} />
      </div>
    </aside>
  )
}

export default HomeSidebar
