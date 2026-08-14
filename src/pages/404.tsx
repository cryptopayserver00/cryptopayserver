import Link from 'next/link'

import MetaTags from '@/components/Common/MetaTags'
import { Button } from '@/components/ui/button'
import { SiteLogo } from '@/components/Logo/SiteLogo'

const Custom404 = () => {
  return (
    <>
      <MetaTags title="Not found" />
      <div className="mx-auto max-w-screen-lg px-4">
        <div className="mt-32">
          <SiteLogo />

          <div className="mt-8 flex items-center gap-1">
            <span className="font-bold">404.</span>
            <span>That&apos;s an error.</span>
          </div>

          <p className="mt-4 text-muted-foreground">
            The requested URL was not found on this server. That&apos;s all we know.
          </p>

          <Button size="lg" className="mt-6" asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </>
  )
}

export default Custom404
