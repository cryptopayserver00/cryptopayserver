import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, ShieldAlert } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useStorePresistStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import { WalletSetupLayout } from '../WalletSetupLayout'

const CREATE_STEPS = ['Choose', 'Create', 'Secure', 'Backup']

const tips = [
  {
    title: 'Only recovery path',
    body: 'The mnemonic phrase is the only way to recover wallet assets if this server is lost.',
  },
  {
    title: 'Never share it',
    body: 'Anyone with the phrase can move funds. Support will never ask for it.',
  },
  {
    title: 'Write it offline',
    body: 'Handwrite the words and store them somewhere safe — avoid screenshots and cloud notes.',
  },
]

const PhraseIntro = () => {
  const router = useRouter()

  const { isStore } = useStorePresistStore(
    useShallow((state) => ({
      isStore: state.isStore,
    }))
  )

  useEffect(() => {
    if (!isStore) {
      router.push('/stores/create')
    }
  }, [isStore, router])

  return (
    <WalletSetupLayout
      title="Back up your mnemonic phrase"
      description="Before you continue, take a minute to understand how to keep this phrase safe."
      steps={CREATE_STEPS}
      currentStep={4}
      backHref="/wallet/setPassword"
      backLabel="Back"
    >
      <div className="space-y-5">
        <Alert>
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Security first</AlertTitle>
          <AlertDescription>
            You are about to reveal recovery words for this store wallet. Make sure nobody can see
            your screen.
          </AlertDescription>
        </Alert>

        <ul className="space-y-3">
          {tips.map((tip) => (
            <li
              key={tip.title}
              className="flex gap-3 rounded-xl border bg-card p-4"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div className="space-y-1">
                <p className="text-sm font-medium">{tip.title}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{tip.body}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button onClick={() => router.push('/wallet/phrase/backup')}>
            Back up mnemonic phrase
          </Button>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Backup later
          </Button>
        </div>
      </div>
    </WalletSetupLayout>
  )
}

export default PhraseIntro
