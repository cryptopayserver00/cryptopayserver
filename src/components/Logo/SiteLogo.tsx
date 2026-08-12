import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type SiteLogoProps = {
  collapsed?: boolean
  className?: string
  href?: string
}

export function SiteLogo({ collapsed = false, className, href }: SiteLogoProps) {
  return (
    <Button
      variant="ghost"
      className={cn(
        'h-auto p-1.5 hover:bg-sky-50 rounded-xl transition-all duration-200',
        className
      )}
      onClick={() => {
        window.location.href = href || '/'
      }}
    >
      <div className={cn('flex items-center', collapsed ? 'gap-0' : 'gap-2')}>
        <div
          className="
            w-9 h-9 rounded-lg flex items-center justify-center shrink-0
            bg-gradient-to-br from-blue-600 to-sky-400
            shadow-md shadow-sky-200
            text-white text-xl font-bold
            select-none
          "
        >
          C
        </div>

        {!collapsed && (
          <span
            className="
              font-extrabold text-lg tracking-wide
              bg-gradient-to-r from-blue-600 to-sky-400
              bg-clip-text text-transparent
              select-none
            "
          >
            CRYPTOPAY
          </span>
        )}
      </div>
    </Button>
  )
}
