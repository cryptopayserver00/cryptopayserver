import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Send,
  ArrowRight,
  ArrowUpRight,
  Terminal,
  Check,
  Lock,
  Ghost,
  Wallet,
  LayoutDashboard,
  Bell,
  Puzzle,
  Store,
} from 'lucide-react'
import { SiGithub } from '@icons-pack/react-simple-icons'
import { Button } from '@/components/ui/button'

const CHAINS = [
  'Bitcoin',
  'Lightning',
  'Ethereum',
  'Solana',
  'BSC',
  'Litecoin',
  'XRP',
  'TON',
  'TRON',
]

const WHY = [
  'You trade or receive crypto across more than one chain.',
  'You run a buy-and-hold strategy and want to track it yourself.',
  'You want real insight into your portfolio, not a dashboard someone else owns.',
  'Privacy and data ownership actually matter to you.',
  'You prefer minimal tools over bloated dashboards.',
  'You want zero telemetry — your server reports to nobody.',
]

const FEATURES = [
  {
    n: '01',
    icon: LayoutDashboard,
    title: 'Dashboard',
    body: 'Daily order counts, transaction volume, and sales — read at a glance, not buried in exports.',
  },
  {
    n: '02',
    icon: Wallet,
    title: 'Wallet management',
    body: 'One mnemonic phrase, addresses across every supported chain. Import, export, or generate fresh.',
  },
  {
    n: '03',
    icon: Store,
    title: 'Stores',
    body: 'Every store gets its own wallet. Fill in basic details and start accepting payments in minutes.',
  },
  {
    n: '04',
    icon: Bell,
    title: 'Notifications',
    body: 'In-app alerts for settled orders, incoming transactions, and version updates — nothing leaves your server.',
  },
  {
    n: '05',
    icon: Lock,
    title: 'Keys, on your terms',
    body: 'View gas fees, inspect private keys, sign transactions — all server-side, all under your control.',
  },
  {
    n: '06',
    icon: Puzzle,
    title: 'Plugins',
    body: 'Shopify, point of sale, pay buttons, crowdfunds. Connect the storefronts you already run.',
  },
]

const RECEIPT = [
  { label: 'Subscription fee', value: '$0.00' },
  { label: 'Data collection', value: '$0.00' },
  { label: 'Third-party ads', value: '$0.00' },
  { label: 'Telemetry sent', value: '$0.00' },
]

function TerminalCard() {
  const command = 'docker run -d -p 5230:5230 cryptopayserver/cryptopayserver'
  const [typed, setTyped] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      i += 1
      setTyped(command.slice(0, i))
      if (i >= command.length) {
        clearInterval(id)
        setTimeout(() => setDone(true), 300)
      }
    }, 28)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="rounded-lg border border-white/10 bg-[#0F1729] shadow-2xl shadow-black/40">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="ml-2 text-xs text-white/40">your-server — bash</span>
      </div>

      <div className="p-5 text-[13px] leading-relaxed sm:p-6 sm:text-sm">
        <div className="flex flex-wrap items-center gap-2 text-white/70">
          <span className="text-[#E8A33D]">$</span>
          <span className="text-white/90">{typed}</span>
          {!done && (
            <span className="inline-block h-4 w-[7px] animate-[blink_1s_step-end_infinite] bg-[#E8A33D]" />
          )}
        </div>

        {done && (
          <div className="mt-4 space-y-3 border-t border-dashed border-white/10 pt-4 animate-in fade-in duration-500">
            <p className="flex items-center gap-2 text-[#5FE3C0]">
              <Check className="h-3.5 w-3.5" /> Store is live at :5230
            </p>
            <div className="rounded-md bg-[#F4F0E6] px-4 py-3 text-[#0A0F1A]">
              <p className="mb-2 text-[11px] uppercase tracking-wider text-[#0A0F1A]/50">
                Nothing sent home
              </p>
              {RECEIPT.map((r) => (
                <div key={r.label} className="flex items-center justify-between py-0.5">
                  <span className="text-[#0A0F1A]/70">{r.label}</span>
                  <span className="text-[#0A0F1A]/40 line-through">{r.value}</span>
                </div>
              ))}
              <div className="mt-2 flex items-center justify-between border-t border-dashed border-[#0A0F1A]/15 pt-2 font-medium">
                <span>Your control</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Welcome() {
  return (
    <div className="min-h-screen bg-[#0A0F1A] font-sans text-[#E7E5DC] antialiased">
      <header className="border-b border-white/[0.06]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2 font-mono font-bold">
            <Terminal className="h-4 w-4 text-[#E8A33D]" />
            CryptoPayServer
          </div>
          <nav className="hidden items-center gap-8 text-sm text-white/60 md:flex">
            <a href="#features" className="transition-colors hover:text-white">
              Features
            </a>
            <a href="#chains" className="transition-colors hover:text-white">
              Chains
            </a>
            <Link
              href="https://cryptopayserver.gitbook.io/cryptopayserver"
              target="_blank"
              className="transition-colors hover:text-white"
            >
              Docs
            </Link>
            <Link
              href="https://github.com/cryptopayserver00/cryptopayserver"
              target="_blank"
              className="transition-colors hover:text-white"
            >
              GitHub
            </Link>
          </nav>
          <Button
            asChild
            size="sm"
            className="bg-[#E8A33D] font-medium text-[#0A0F1A] hover:bg-[#E8A33D]/90"
          >
            <Link href="/login">
              Live demo <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:pb-28 lg:pt-24">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs text-white/50">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5FE3C0]" />
            MIT licensed · zero telemetry
          </div>

          <h1 className="font-mono text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            Your crypto payments.
            <br />
            <span className="text-[#E8A33D]">Your server.</span> Your ledger.
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/60 sm:text-lg">
            CryptoPayServer is an open-source, self-hosted payment gateway for Bitcoin, Ethereum,
            Solana and seven other chains. No custodian, no subscription, no one watching your
            transaction history but you.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-[#E8A33D] font-medium text-[#0A0F1A] hover:bg-[#E8A33D]/90"
            >
              <Link href="/register">
                Get started <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/15 bg-transparent text-white hover:bg-white/5"
            >
              <Link href="https://github.com/cryptopayserver00/cryptopayserver" target="_blank">
                <SiGithub className="mr-1.5 h-4 w-4" /> View source
              </Link>
            </Button>
          </div>
        </div>

        <TerminalCard />
      </section>

      <section id="chains" className="border-y border-white/[0.06] bg-white/[0.02] py-5">
        <div className="overflow-hidden">
          <div className="flex w-max animate-[marquee_28s_linear_infinite] gap-10 font-mono text-sm text-white/40">
            {[...CHAINS, ...CHAINS, ...CHAINS].map((c, i) => (
              <span key={i} className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-[#E8A33D]">·</span>
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="font-mono text-xs uppercase tracking-widest text-white/40">
          This is for you if
        </p>
        <div className="mt-6 grid gap-px overflow-hidden rounded-lg border border-white/[0.06] sm:grid-cols-2">
          {WHY.map((line, i) => (
            <div key={i} className="flex items-start gap-3 bg-[#0A0F1A] p-5">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#5FE3C0]" />
              <span className="text-sm leading-relaxed text-white/70">{line}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[#E8A33D]">
              What's on the ledger
            </p>
            <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
              Everything a store needs, nothing it doesn't
            </h2>
          </div>
        </div>

        <div className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
          {FEATURES.map((f) => (
            <div
              key={f.n}
              className="grid grid-cols-[auto_auto_1fr] items-start gap-5 py-6 sm:gap-8"
            >
              <span className="pt-0.5 font-mono text-sm text-white/25">{f.n}</span>
              <f.icon className="mt-0.5 h-5 w-5 text-[#E8A33D]" />
              <div>
                <h3 className="font-medium">{f.title}</h3>
                <p className="mt-1 max-w-xl text-sm leading-relaxed text-white/55">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/[0.06] py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6">
          <p className="text-xs uppercase tracking-widest text-white/30">Built on</p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-sm text-white/50">
            <span>Next.js</span>
            <span>React</span>
            <span>MySQL</span>
            <span>Prisma</span>
            <span>Redis</span>
            <span>TypeScript</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <Ghost className="mx-auto h-8 w-8 text-white/20" />
        <h2 className="mx-auto mt-6 max-w-xl text-2xl font-semibold sm:text-3xl">
          Deploy your own payment server in one line.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/50">
          Open <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono">:5230</code> and start
          accepting payments today.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="bg-[#E8A33D] font-medium text-[#0A0F1A] hover:bg-[#E8A33D]/90"
          >
            <Link href="/register">
              Create your account <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="ghost"
            className="text-white/60 hover:bg-white/5 hover:text-white"
          >
            <Link href="https://cryptopayserver.gitbook.io/cryptopayserver" target="_blank">
              Read the docs <ArrowUpRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-xs text-white/35 sm:flex-row">
          <span>© {new Date().getFullYear()} CryptoPayServer — MIT licensed, self-hosted.</span>
          <div className="flex items-center gap-5">
            <Link
              href="https://github.com/cryptopayserver00/cryptopayserver"
              target="_blank"
              className="flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <SiGithub className="h-3.5 w-3.5" /> GitHub
            </Link>
            <Link
              href="https://t.me/cryptopayserver"
              target="_blank"
              className="flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <Send className="h-3.5 w-3.5" /> Telegram
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
