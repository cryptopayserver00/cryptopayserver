import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Instrument_Serif, DM_Sans } from 'next/font/google'
import {
  ArrowRight,
  ArrowUpRight,
  FileText,
  HandCoins,
  Link2,
  Shield,
  Wallet,
  Webhook,
} from 'lucide-react'
import { SiGithub } from '@icons-pack/react-simple-icons'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const display = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-cps-display',
  display: 'swap',
})

const sans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cps-sans',
  display: 'swap',
})

const CHAINS = [
  'Bitcoin',
  'Lightning',
  'Litecoin',
  'Bitcoin Cash',
  'Ethereum',
  'BSC',
  'Arbitrum',
  'Optimism',
  'Base',
  'Polygon',
  'Avalanche',
  'Solana',
  'TRON',
  'TON',
  'XRP',
]

const CAPABILITIES = [
  {
    icon: FileText,
    title: 'Invoices',
    body: 'Fixed-rate checkout invoices with QR codes, expiry, and status tracking — UI or API.',
  },
  {
    icon: Link2,
    title: 'Payment requests',
    body: 'Reusable shareable pages so buyers can pay later, including partial settlement.',
  },
  {
    icon: HandCoins,
    title: 'Pull payments & payouts',
    body: 'Refunds, rewards, and withdrawals claimed by recipients and released from your wallet.',
  },
  {
    icon: Wallet,
    title: 'Multi-chain wallets',
    body: 'One seed across UTXO, EVM, Solana, TRON, TON, and XRP — balances, fees, and sends.',
  },
  {
    icon: Webhook,
    title: 'Webhooks & reports',
    body: 'Signed payment callbacks plus store reporting you can export when you need it.',
  },
  {
    icon: Shield,
    title: 'Self-hosted by design',
    body: 'Keys stay on your infrastructure. No custodian, no telemetry, MIT licensed.',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Create a store & wallet',
    body: 'Generate or import a mnemonic, then attach it to a store.',
  },
  {
    n: '02',
    title: 'Issue an invoice',
    body: 'Pick chain and asset, lock the rate, share the payment page.',
  },
  {
    n: '03',
    title: 'Settle on-chain',
    body: 'Watch status update as funds confirm — or claim testnet coins while you build.',
  },
]

function HeroVisual() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(15,118,110,0.14),transparent_55%),radial-gradient(ellipse_at_90%_10%,rgba(15,23,42,0.08),transparent_45%),linear-gradient(180deg,#F7FAF9_0%,#EEF5F3_48%,#F7FAF9_100%)]" />
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.35]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="cps-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M48 0H0V48" fill="none" stroke="#0F766E" strokeOpacity="0.12" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cps-grid)" />
      </svg>
      <div className="absolute -right-16 top-24 h-[420px] w-[420px] rounded-full border border-teal-800/10 bg-teal-700/[0.06] blur-[1px] animate-[cps-float_10s_ease-in-out_infinite]" />
      <div className="absolute bottom-10 left-[-80px] h-[280px] w-[280px] rounded-full border border-slate-900/10 bg-slate-900/[0.04] animate-[cps-float_14s_ease-in-out_infinite_reverse]" />
    </div>
  )
}

function LedgerPreview() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 180)
    return () => clearTimeout(t)
  }, [])

  const rows = [
    { id: 'INV-1842', chain: 'ETH', amount: '0.42 ETH', status: 'Settled' },
    { id: 'INV-1843', chain: 'BTC', amount: '0.015 BTC', status: 'Processing' },
    { id: 'PR-2201', chain: 'SOL', amount: '12.5 SOL', status: 'Pending' },
  ]

  return (
    <div
      className={cn(
        'relative mx-auto w-full max-w-md transition-all duration-700',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      )}
    >
      <div className="overflow-hidden border border-slate-900/10 bg-white/70 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-slate-900/5 px-5 py-3">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">
            Live ledger
          </span>
          <span className="text-xs text-slate-500">testnet · demo</span>
        </div>
        <div className="divide-y divide-slate-900/5">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
              <div className="min-w-0">
                <p className="font-medium text-slate-900">{row.id}</p>
                <p className="text-xs text-slate-500">
                  {row.chain} · {row.amount}
                </p>
              </div>
              <span
                className={cn(
                  'shrink-0 text-xs font-medium',
                  row.status === 'Settled' && 'text-teal-700',
                  row.status === 'Processing' && 'text-amber-700',
                  row.status === 'Pending' && 'text-slate-500'
                )}
              >
                {row.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Welcome() {
  const startHref =
    process.env.NEXT_PUBLIC_DISABLE_PUBLIC_REGISTRATION === 'true' ? '/login' : '/register'

  return (
    <div
      className={cn(
        display.variable,
        sans.variable,
        'min-h-screen bg-[#F7FAF9] text-slate-900 antialiased'
      )}
      style={{ fontFamily: 'var(--font-cps-sans), ui-sans-serif, system-ui, sans-serif' }}
    >
      <header className="relative z-20 border-b border-slate-900/5 bg-[#F7FAF9]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-slate-900"
            style={{ fontFamily: 'var(--font-cps-display), serif' }}
          >
            CryptoPayServer
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
            <a href="#capabilities" className="transition-colors hover:text-slate-900">
              Capabilities
            </a>
            <a href="#how" className="transition-colors hover:text-slate-900">
              How it works
            </a>
            <Link
              href="https://docs.cryptopayserver.online"
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-slate-900"
            >
              Docs
            </Link>
          </nav>
          <Button asChild className="bg-teal-800 text-white hover:bg-teal-700">
            <Link href="/login">
              Sign in <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero: brand + one headline + one sentence + CTAs + full-bleed atmosphere */}
      <section className="relative isolate min-h-[calc(100vh-4.25rem)] overflow-hidden">
        <HeroVisual />

        <div className="relative z-10 mx-auto grid max-w-6xl gap-12 px-6 pb-16 pt-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:pb-24 lg:pt-20">
          <div>
            <p
              className="text-4xl leading-none text-teal-800 sm:text-5xl md:text-6xl"
              style={{ fontFamily: 'var(--font-cps-display), serif' }}
            >
              CryptoPayServer
            </p>

            <h1 className="mt-6 max-w-xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Accept crypto on infrastructure you control.
            </h1>

            <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg">
              Self-hosted invoices, wallets, and payouts across Bitcoin, EVM, Solana, TRON, TON,
              and more — without giving keys or history to a third party.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="bg-teal-800 text-white hover:bg-teal-700">
                <Link href={startHref}>
                  Start accepting payments <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-slate-900/15 bg-white/60 text-slate-800 hover:bg-white"
              >
                <Link
                  href="https://github.com/cryptopayserver00/cryptopayserver"
                  target="_blank"
                  rel="noreferrer"
                >
                  <SiGithub className="mr-1.5 h-4 w-4" />
                  View source
                </Link>
              </Button>
            </div>
          </div>

          <LedgerPreview />
        </div>
      </section>

      <section className="border-y border-slate-900/5 bg-white/50 py-4">
        <div className="overflow-hidden">
          <div
            className="flex w-max gap-10 text-sm font-medium text-slate-500"
            style={{ animation: 'cps-marquee 36s linear infinite' }}
          >
            {[...CHAINS, ...CHAINS].map((c, i) => (
              <span key={`${c}-${i}`} className="whitespace-nowrap">
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="capabilities" className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-800">
          Built for merchants
        </p>
        <h2
          className="mt-3 max-w-2xl text-3xl text-slate-900 sm:text-4xl"
          style={{ fontFamily: 'var(--font-cps-display), serif' }}
        >
          Payment rails for stores that want custody of their own money.
        </h2>
        <p className="mt-3 max-w-2xl text-slate-600">
          CryptoPayServer is the open-source gateway behind invoices, payment requests, pull
          payments, reporting, and multi-chain wallets — the same surface you use in this stack.
        </p>

        <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((item) => (
            <div key={item.title} className="border-t border-slate-900/10 pt-5">
              <item.icon className="h-5 w-5 text-teal-800" />
              <h3 className="mt-3 text-base font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="border-y border-slate-900/5 bg-slate-900 text-slate-100">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">
            How it works
          </p>
          <h2
            className="mt-3 max-w-xl text-3xl sm:text-4xl"
            style={{ fontFamily: 'var(--font-cps-display), serif' }}
          >
            From empty server to first paid invoice.
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.n}>
                <p className="font-mono text-sm text-teal-300/80">{step.n}</p>
                <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 text-center sm:py-24">
        <h2
          className="mx-auto max-w-2xl text-3xl text-slate-900 sm:text-4xl"
          style={{ fontFamily: 'var(--font-cps-display), serif' }}
        >
          Run it locally on :8888, or deploy your own instance.
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-slate-600">
          Switch mainnet and testnet in the app, claim faucet funds while you integrate, then go
          live when you are ready.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="bg-teal-800 text-white hover:bg-teal-700">
            <Link href={startHref}>
              Create account <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="ghost" className="text-slate-700 hover:bg-slate-900/5">
            <Link href="https://docs.cryptopayserver.online" target="_blank" rel="noreferrer">
              Read the docs <ArrowUpRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-slate-900/5 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-slate-500 sm:flex-row">
          <span>© {new Date().getFullYear()} CryptoPayServer — MIT · self-hosted</span>
          <div className="flex items-center gap-5">
            <Link
              href="https://github.com/cryptopayserver00/cryptopayserver"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-900"
            >
              <SiGithub className="h-3.5 w-3.5" /> GitHub
            </Link>
            <Link href="/login" className="transition-colors hover:text-slate-900">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
