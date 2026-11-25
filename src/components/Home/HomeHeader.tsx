import { Button } from '@/components/ui/button'
import { SiteLogo } from '@/components/Logo/SiteLogo'
import { Menu } from 'lucide-react'
import { useStorePresistStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'

type HomeHeaderProps = {
  showMenuButton?: boolean
  onMenuClick?: () => void
}

const HomeHeader = ({ showMenuButton = false, onMenuClick }: HomeHeaderProps) => {
  const { storeName } = useStorePresistStore(
    useShallow((state) => ({
      storeName: state.storeName,
    }))
  )

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-white/90 backdrop-blur-md lg:hidden">
      <div className="flex h-14 sm:h-16 items-center gap-2 px-3 sm:px-4">
        {showMenuButton && (
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0"
            aria-label="Open menu"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <div className="min-w-0">
          <SiteLogo href="/dashboard" className="!p-1" />
        </div>

        {storeName ? (
          <p className="text-sm text-muted-foreground truncate max-w-[50vw] ml-1">{storeName}</p>
        ) : null}
      </div>
    </header>
  )
}

export default HomeHeader
