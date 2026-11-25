import React, { useEffect, useState } from 'react'
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
  PanelLeftClose,
  PanelLeftOpen,
  X,
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
import { cn } from '@/lib/utils'

type HomeSidebarProps = {
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  mobileOpen?: boolean
  onMobileOpenChange?: (open: boolean) => void
}

type NavItemProps = {
  href: string
  icon: React.ReactNode
  label: string
  active: boolean
  collapsed: boolean
  onNavigate?: () => void
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label, active, collapsed, onNavigate }) => (
  <Link
    href={href}
    onClick={onNavigate}
    className={cn(
      'flex items-center gap-3 px-3 py-2 text-xs transition-colors rounded-md',
      active
        ? 'bg-blue-50 text-[#0098e5] font-semibold'
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
      collapsed && 'justify-center px-2'
    )}
    title={collapsed ? label : undefined}
  >
    <span className="shrink-0">{icon}</span>
    {!collapsed && <span className="truncate">{label}</span>}
  </Link>
)

const HomeSidebar = ({
  collapsed,
  onCollapsedChange,
  mobileOpen = false,
  onMobileOpenChange,
}: HomeSidebarProps) => {
  const router = useRouter()

  const [paymentsOpen, setPaymentsOpen] = useState(router.pathname.includes('/payments'))
  const [pluginsOpen, setPluginsOpen] = useState(router.pathname.includes('/plugins'))

  const { network } = useUserPresistStore(
    useShallow((state) => ({
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

  useEffect(() => {
    const close = () => onMobileOpenChange?.(false)
    router.events.on('routeChangeStart', close)
    return () => router.events.off('routeChangeStart', close)
  }, [router.events, onMobileOpenChange])

  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileOpen])

  const closeMobile = () => onMobileOpenChange?.(false)

  const renderNav = (opts: { iconOnly: boolean; showCollapse: boolean }) => {
    const iconOnly = opts.iconOnly

    return (
      <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden py-6">
        <SidebarHeader className="mb-4" collapsed={iconOnly} />

        <nav className="flex-1 px-3 space-y-1">
          <NavItem
            href="/dashboard"
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            active={router.pathname === '/dashboard'}
            collapsed={iconOnly}
            onNavigate={closeMobile}
          />

          {isStore && isWallet && (
            <>
              <NavItem
                href="/settings"
                icon={<Settings size={18} />}
                label="Store Settings"
                active={router.pathname === '/settings'}
                collapsed={iconOnly}
                onNavigate={closeMobile}
              />
              <NavItem
                href="/account"
                icon={<Settings size={18} />}
                label="Account Settings"
                active={router.pathname === '/account'}
                collapsed={iconOnly}
                onNavigate={closeMobile}
              />

              <div className="pt-6 pb-2 px-3">
                <p
                  className={cn(
                    'text-[10px] font-semibold text-gray-400 uppercase tracking-wider',
                    iconOnly ? 'hidden' : 'block'
                  )}
                >
                  WALLETS
                </p>
              </div>

              <NavItem
                href="/wallets/assets"
                icon={<DollarSign size={18} />}
                label="My Assets"
                active={router.pathname === '/wallets/assets'}
                collapsed={iconOnly}
                onNavigate={closeMobile}
              />
              <NavItem
                href="/wallets/manage"
                icon={<Shield size={18} />}
                label="Wallet Management"
                active={router.pathname === '/wallets/manage'}
                collapsed={iconOnly}
                onNavigate={closeMobile}
              />
              <NavItem
                href="/wallets/bitcoin"
                icon={
                  <Image src={BitcoinSVG} alt="icon" width={18} height={18} className="h-5 w-5" />
                }
                label="Bitcoin"
                active={router.pathname === '/wallets/bitcoin'}
                collapsed={iconOnly}
                onNavigate={closeMobile}
              />
              <NavItem
                href="/wallets/bitcoin/lightning"
                icon={
                  <Image src={BitcoinSVG} alt="icon" width={18} height={18} className="h-5 w-5" />
                }
                label="Lightning"
                active={router.pathname === '/wallets/bitcoin/lightning'}
                collapsed={iconOnly}
                onNavigate={closeMobile}
              />
              <NavItem
                href="/wallets/litecoin"
                icon={
                  <Image src={LitecoinSVG} alt="icon" width={18} height={18} className="h-5 w-5" />
                }
                label="Litecoin"
                active={router.pathname === '/wallets/litecoin'}
                collapsed={iconOnly}
                onNavigate={closeMobile}
              />
              <NavItem
                href="/wallets/xrp"
                icon={<Image src={XrpSVG} alt="icon" width={18} height={18} className="w-5 h-5" />}
                label="Xrp"
                active={router.pathname === '/wallets/xrp'}
                collapsed={iconOnly}
                onNavigate={closeMobile}
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
                collapsed={iconOnly}
                onNavigate={closeMobile}
              />
              <NavItem
                href="/wallets/ethereum"
                icon={
                  <Image src={EthereumSVG} alt="icon" width={18} height={18} className="h-5 w-5" />
                }
                label="Ethereum"
                active={router.pathname === '/wallets/ethereum'}
                collapsed={iconOnly}
                onNavigate={closeMobile}
              />
              <NavItem
                href="/wallets/tron"
                icon={<Image src={TronSVG} alt="icon" width={18} height={18} className="h-5 w-5" />}
                label="Tron"
                active={router.pathname === '/wallets/tron'}
                collapsed={iconOnly}
                onNavigate={closeMobile}
              />
              <NavItem
                href="/wallets/solana"
                icon={
                  <Image src={SolanaSVG} alt="icon" width={18} height={18} className="h-5 w-5" />
                }
                label="Solana"
                active={router.pathname === '/wallets/solana'}
                collapsed={iconOnly}
                onNavigate={closeMobile}
              />
              <NavItem
                href="/wallets/bsc"
                icon={<Image src={BscSVG} alt="icon" width={18} height={18} className="h-5 w-5" />}
                label="Binance Smart Chain"
                active={router.pathname === '/wallets/bsc'}
                collapsed={iconOnly}
                onNavigate={closeMobile}
              />
              <NavItem
                href="/wallets/arbitrum"
                icon={
                  <Image src={ArbitrumSVG} alt="icon" width={18} height={18} className="h-5 w-5" />
                }
                label="Arbitrum"
                active={router.pathname === '/wallets/arbitrum'}
                collapsed={iconOnly}
                onNavigate={closeMobile}
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
                  collapsed={iconOnly}
                  onNavigate={closeMobile}
                />
              )}
              <NavItem
                href="/wallets/avalanche"
                icon={
                  <Image src={AvalancheSVG} alt="icon" width={18} height={18} className="h-5 w-5" />
                }
                label="Avalanche"
                active={router.pathname === '/wallets/avalanche'}
                collapsed={iconOnly}
                onNavigate={closeMobile}
              />
              <NavItem
                href="/wallets/polygon"
                icon={
                  <Image src={PolygonSVG} alt="icon" width={18} height={18} className="h-5 w-5" />
                }
                label="Polygon"
                active={router.pathname === '/wallets/polygon'}
                collapsed={iconOnly}
                onNavigate={closeMobile}
              />
              <NavItem
                href="/wallets/base"
                icon={<Image src={BaseSVG} alt="icon" width={18} height={18} className="h-5 w-5" />}
                label="Base"
                active={router.pathname === '/wallets/base'}
                collapsed={iconOnly}
                onNavigate={closeMobile}
              />
              <NavItem
                href="/wallets/optimism"
                icon={
                  <Image src={OptimismSVG} alt="icon" width={18} height={18} className="h-5 w-5" />
                }
                label="Optimism"
                active={router.pathname === '/wallets/optimism'}
                collapsed={iconOnly}
                onNavigate={closeMobile}
              />
              <NavItem
                href="/wallets/ton"
                icon={<Image src={TonSVG} alt="icon" width={18} height={18} className="h-5 w-5" />}
                label="Ton"
                active={router.pathname === '/wallets/ton'}
                collapsed={iconOnly}
                onNavigate={closeMobile}
              />

              <div className="pt-6 pb-2 px-3">
                <p
                  className={cn(
                    'text-[10px] font-semibold text-gray-400 uppercase tracking-wider',
                    iconOnly ? 'hidden' : 'block'
                  )}
                >
                  PAYMENTS
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setPaymentsOpen(!paymentsOpen)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-xs transition-colors rounded-md text-gray-700 hover:bg-gray-100',
                    router.pathname.includes('/payments') && 'text-[#0098e5] font-semibold',
                    iconOnly && 'justify-center'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard size={18} />
                    {!iconOnly && <span>PAYMENTS</span>}
                  </div>
                  {!iconOnly && (
                    <ChevronDown
                      size={14}
                      className={cn(
                        'transition-transform duration-200',
                        paymentsOpen && 'rotate-180'
                      )}
                    />
                  )}
                </button>

                {(paymentsOpen || iconOnly) && (
                  <div className={cn('space-y-1 mt-1', !iconOnly && 'pl-4')}>
                    <NavItem
                      href="/payments/transactions"
                      icon={<FileText size={18} />}
                      label="Transactions"
                      active={router.pathname === '/payments/transactions'}
                      collapsed={iconOnly}
                      onNavigate={closeMobile}
                    />
                    <NavItem
                      href="/payments/invoices"
                      icon={<FileText size={18} />}
                      label="Invoices"
                      active={router.pathname === '/payments/invoices'}
                      collapsed={iconOnly}
                      onNavigate={closeMobile}
                    />
                    <NavItem
                      href="/payments/reporting"
                      icon={<BarChart2 size={18} />}
                      label="Reporting"
                      active={router.pathname === '/payments/reporting'}
                      collapsed={iconOnly}
                      onNavigate={closeMobile}
                    />
                    <NavItem
                      href="/payments/requests"
                      icon={<ArrowDownLeft size={18} />}
                      label="Requests"
                      active={router.pathname === '/payments/requests'}
                      collapsed={iconOnly}
                      onNavigate={closeMobile}
                    />
                    <NavItem
                      href="/payments/pullpayments"
                      icon={<ArrowUpRight size={18} />}
                      label="Pull Payments"
                      active={router.pathname === '/payments/pullpayments'}
                      collapsed={iconOnly}
                      onNavigate={closeMobile}
                    />
                    <NavItem
                      href="/payments/payouts"
                      icon={<Receipt size={18} />}
                      label="Payouts"
                      active={router.pathname === '/payments/payouts'}
                      collapsed={iconOnly}
                      onNavigate={closeMobile}
                    />
                  </div>
                )}
              </div>

              <div className="pt-6 pb-2 px-3">
                <p
                  className={cn(
                    'text-[10px] font-semibold text-gray-400 uppercase tracking-wider',
                    iconOnly ? 'hidden' : 'block'
                  )}
                >
                  PLUGINS
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setPluginsOpen(!pluginsOpen)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-xs transition-colors rounded-md text-gray-700 hover:bg-gray-100',
                    router.pathname.includes('/plugins') && 'text-[#0098e5] font-semibold',
                    iconOnly && 'justify-center'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Blocks size={18} />
                    {!iconOnly && <span>PLUGINS</span>}
                  </div>
                  {!iconOnly && (
                    <ChevronDown
                      size={14}
                      className={cn(
                        'transition-transform duration-200',
                        pluginsOpen && 'rotate-180'
                      )}
                    />
                  )}
                </button>

                {(pluginsOpen || iconOnly) && (
                  <div className={cn('space-y-1 mt-1', !iconOnly && 'pl-4')}>
                    <NavItem
                      href="/plugins/shopify"
                      icon={<ShoppingBag size={18} />}
                      label="Shopify"
                      active={router.pathname === '/plugins/shopify'}
                      collapsed={iconOnly}
                      onNavigate={closeMobile}
                    />
                    <NavItem
                      href="/plugins/pointofsale"
                      icon={<StoreIcon size={18} />}
                      label="Point of Sale"
                      active={router.pathname === '/plugins/pointofsale'}
                      collapsed={iconOnly}
                      onNavigate={closeMobile}
                    />
                    <NavItem
                      href="/plugins/paybutton"
                      icon={<CircleDot size={18} />}
                      label="Pay Button"
                      active={router.pathname === '/plugins/paybutton'}
                      collapsed={iconOnly}
                      onNavigate={closeMobile}
                    />
                    <NavItem
                      href="/plugins/crowdfund"
                      icon={<Users size={18} />}
                      label="Crowdfund"
                      active={router.pathname === '/plugins/crowdfund'}
                      collapsed={iconOnly}
                      onNavigate={closeMobile}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </nav>

        {opts.showCollapse && (
          <div className={cn('px-3 pb-2', iconOnly && 'flex justify-center')}>
            <button
              type="button"
              onClick={() => onCollapsedChange(!collapsed)}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-xs text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {iconOnly ? (
                <PanelLeftOpen className="h-4 w-4 mx-auto" />
              ) : (
                <>
                  <PanelLeftClose className="h-4 w-4" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          </div>
        )}

        <SidebarFooter collapsed={iconOnly} />
      </div>
    )
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:block fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-40 transition-all duration-300',
          collapsed ? 'w-[80px]' : 'w-[250px]'
        )}
      >
        {renderNav({ iconOnly: collapsed, showCollapse: true })}
      </aside>

      {/* Mobile drawer backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden',
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={closeMobile}
        aria-hidden={!mobileOpen}
      />

      {/* Mobile drawer */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-[min(100%,16rem)] bg-white border-r border-gray-200 shadow-xl transition-transform duration-200 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-hidden={!mobileOpen}
      >
        <div className="absolute top-3 right-3 z-10">
          <button
            type="button"
            aria-label="Close menu"
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
            onClick={closeMobile}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {renderNav({ iconOnly: false, showCollapse: false })}
      </aside>
    </>
  )
}

export default HomeSidebar
