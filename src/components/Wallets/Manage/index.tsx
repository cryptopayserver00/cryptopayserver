import Link from 'next/link'
import {
  ChevronRight,
  Lock,
  KeyRound,
  ShieldCheck,
  Wallet,
  RadioTower,
  Contact,
  Settings,
} from 'lucide-react'

const menuItems = [
  { href: '/wallets/manage/wallet', label: 'Wallet Manage', icon: Wallet },
  { href: '/wallets/manage/password', label: 'Payment Password', icon: Lock },
  { href: '/wallets/manage/privatekey', label: 'Private Key', icon: KeyRound },
  { href: '/wallets/manage/addressbook', label: 'Address Book', icon: Contact },
  { href: '/wallets/manage/audit', label: 'Security Audit', icon: ShieldCheck },
  { href: '/wallets/manage/network', label: 'Customize Network', icon: RadioTower },
  { href: null, label: 'Others', icon: Settings },
]

const Manage = () => {
  return (
    <div>
      <div className="mx-auto max-w-screen-lg px-4">
        <h2 className="text-lg font-semibold">Wallet Management</h2>

        <nav className="mt-4 divide-y rounded-lg border bg-card">
          {menuItems.map((item) => {
            const IconComponent = item.icon
            const content = (
              <>
                <IconComponent className="h-5 w-5 text-muted-foreground" />
                <span className="flex-1 font-medium">{item.label}</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </>
            )

            return item.href ? (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
              >
                {content}
              </Link>
            ) : (
              <button
                key={item.label}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
              >
                {content}
              </button>
            )
          })}
        </nav>

        {/* <div className="mt-10">
          <p className="font-semibold">Base Setting</p>
          <div className="mt-2">
            <button className="w-full">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xl">Wallet backup</span>
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>
            </button>
          </div>
        </div> */}
      </div>
    </div>
  )
}

export default Manage
