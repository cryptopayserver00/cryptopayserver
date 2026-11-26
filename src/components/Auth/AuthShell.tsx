import Link from 'next/link'
import { Instrument_Serif, DM_Sans } from 'next/font/google'
import { SiGithub } from '@icons-pack/react-simple-icons'
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

type AuthShellProps = {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}

export function AuthShell({ title, subtitle, children, className }: AuthShellProps) {
  return (
    <div
      className={cn(
        display.variable,
        sans.variable,
        'relative flex min-h-screen flex-col overflow-hidden bg-[#f7f8f6] text-slate-900',
        className
      )}
      style={{ fontFamily: 'var(--font-cps-sans), ui-sans-serif, system-ui, sans-serif' }}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <svg className="h-full w-full opacity-[0.35]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="cps-auth-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M48 0H0V48" fill="none" stroke="rgb(15 23 42 / 0.06)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cps-auth-grid)" />
        </svg>
        <div className="absolute -right-20 top-16 h-[360px] w-[360px] rounded-full border border-teal-800/10 bg-teal-700/[0.06] blur-[1px] animate-[cps-float_10s_ease-in-out_infinite]" />
        <div className="absolute bottom-8 left-[-60px] h-[240px] w-[240px] rounded-full border border-slate-900/10 bg-slate-900/[0.04] animate-[cps-float_14s_ease-in-out_infinite_reverse]" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-md items-center justify-between px-6 pt-8 sm:pt-12">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-800 text-sm font-bold text-white shadow-sm shadow-teal-900/20 transition-colors group-hover:bg-teal-700">
            C
          </span>
          <span
            className="text-xl tracking-tight text-slate-900"
            style={{ fontFamily: 'var(--font-cps-display), serif' }}
          >
            CryptoPayServer
          </span>
        </Link>
        <Link
          href="/"
          className="text-sm text-slate-500 transition-colors hover:text-slate-900"
        >
          Home
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-10">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">
            Self-hosted payments
          </p>
          <h1
            className="mt-3 text-3xl leading-tight text-slate-900 sm:text-4xl"
            style={{ fontFamily: 'var(--font-cps-display), serif' }}
          >
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{subtitle}</p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-slate-900/8 bg-white/80 p-6 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:p-7">
          {children}
        </div>
      </main>

      <footer className="relative z-10 border-t border-slate-900/5 py-6">
        <div className="mx-auto flex max-w-md flex-col items-center justify-between gap-3 px-6 text-sm text-slate-500 sm:flex-row">
          <span>© {new Date().getFullYear()} CryptoPayServer</span>
          <Link
            href="https://github.com/cryptopayserver00/cryptopayserver"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-900"
          >
            <SiGithub className="h-3.5 w-3.5" /> GitHub
          </Link>
        </div>
      </footer>
    </div>
  )
}
