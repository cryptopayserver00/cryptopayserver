import Link from 'next/link'
import { SiGithub } from '@icons-pack/react-simple-icons'

const HomeFooter = () => {
  return (
    <footer className="mt-auto border-t border-slate-900/5 bg-[#f7f8f6]/90">
      <div className="mx-auto flex max-w-screen-xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <span className="text-slate-700">
            © {new Date().getFullYear()} CryptoPayServer
          </span>
          <span className="text-xs text-slate-400">MIT · self-hosted · v0.1.0</span>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <Link
            href="https://github.com/cryptopayserver00/cryptopayserver"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-900"
          >
            <SiGithub className="h-3.5 w-3.5" /> GitHub
          </Link>
          <Link
            href="https://docs.cryptopayserver.online"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-slate-900"
          >
            Docs
          </Link>
          <Link
            href="https://t.me/cryptopayserver"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-slate-900"
          >
            Telegram
          </Link>
          <Link href="/" className="transition-colors hover:text-slate-900">
            Home
          </Link>
        </nav>
      </div>
    </footer>
  )
}

export default HomeFooter
