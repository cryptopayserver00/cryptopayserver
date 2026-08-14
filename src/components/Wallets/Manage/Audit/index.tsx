import { Landmark, ShieldCheck, SquareCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SiGithub } from '@icons-pack/react-simple-icons'

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Multi-party audit',
    description:
      'Crypto Pay Server wallets are regularly reviewed by reputable security auditing companies to ensure asset security',
  },
  {
    icon: Landmark,
    title: 'Self-management',
    description:
      'The wallet private keys and assets are completely under your control, and security and privacy are at the heart of our design',
  },
  {
    icon: SquareCode,
    title: 'Open source code',
    description:
      'Multi-terminal code open source, technical details are freely viewed and audited, open and transparent',
  },
]

const ManageAudit = () => {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="text-lg font-semibold">Security Audit</h1>

      <div className="mt-6 rounded-2xl border bg-gradient-to-b from-muted/60 to-transparent px-6 py-16 text-center">
        <p className="text-3xl font-bold tracking-tight sm:text-4xl">
          Trust comes from transparency
        </p>
        <p className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          Web3 assets are in your control
        </p>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Comprehensive third-party audit, extensive open source code, and jointly build web3
          security
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <Card key={title} className="transition-shadow hover:shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold">Open source code</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          The wallet has completed open source of core code, including core algorithms such as
          mnemonics, private keys, transaction routing, etc., which have been widely verified by the
          technical community.
        </p>
        <Button className="mt-4" asChild>
          <a
            href="https://github.com/cryptopayserver00/cryptopayserver"
            target="_blank"
            rel="noreferrer"
          >
            <SiGithub className="mr-2 h-4 w-4" /> Go to CryptoPayServer GitHub
          </a>
        </Button>
      </div>
    </div>
  )
}

export default ManageAudit
