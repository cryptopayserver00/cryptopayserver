import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'
import { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type WalletSetupLayoutProps = {
  title: string
  description?: string
  steps?: string[]
  currentStep?: number
  backHref?: string
  backLabel?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function WalletSetupLayout({
  title,
  description,
  steps,
  currentStep = 1,
  backHref,
  backLabel = 'Back',
  children,
  footer,
  className,
}: WalletSetupLayoutProps) {
  return (
    <div className={cn('mx-auto w-full max-w-2xl space-y-8', className)}>
      {backHref ? (
        <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1.5 text-muted-foreground">
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        </Button>
      ) : null}

      {steps && steps.length > 0 ? (
        <ol className="flex flex-wrap items-center gap-2">
          {steps.map((label, index) => {
            const stepNumber = index + 1
            const done = stepNumber < currentStep
            const active = stepNumber === currentStep
            return (
              <li key={label} className="flex items-center gap-2">
                {index > 0 && <span className="mx-1 hidden h-px w-4 bg-border sm:block" />}
                <span
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium',
                    done && 'bg-primary/10 text-primary',
                    active && 'bg-primary text-primary-foreground',
                    !done && !active && 'bg-muted text-muted-foreground'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full text-[11px]',
                      done && 'bg-primary text-primary-foreground',
                      active && 'bg-primary-foreground/20',
                      !done && !active && 'bg-background'
                    )}
                  >
                    {done ? <Check className="h-3 w-3" /> : stepNumber}
                  </span>
                  <span className="hidden sm:inline">{label}</span>
                </span>
              </li>
            )
          })}
        </ol>
      ) : null}

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {description ? <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p> : null}
      </div>

      <div>{children}</div>

      {footer ? <div className="pt-2">{footer}</div> : null}
    </div>
  )
}

type WalletOptionCardProps = {
  title: string
  description: string
  icon: ReactNode
  onClick?: () => void
  disabled?: boolean
  badge?: string
  recommended?: boolean
}

export function WalletOptionCard({
  title,
  description,
  icon,
  onClick,
  disabled,
  badge,
  recommended,
}: WalletOptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'group w-full rounded-xl border bg-card p-5 text-left transition',
        'hover:border-primary/40 hover:bg-muted/30',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-border disabled:hover:bg-card',
        recommended && 'border-primary/30 ring-1 ring-primary/10'
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted text-foreground',
            !disabled && 'group-hover:bg-primary/10 group-hover:text-primary'
          )}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold">{title}</p>
            {recommended ? (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                Recommended
              </span>
            ) : null}
            {badge ? (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {badge}
              </span>
            ) : null}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <span className="mt-1 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary">
          →
        </span>
      </div>
    </button>
  )
}
