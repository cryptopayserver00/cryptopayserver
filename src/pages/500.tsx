import Link from 'next/link'

import MetaTags from '@/components/Common/MetaTags'
import { Button } from '@/components/ui/button'
import { SiteLogo } from '@/components/Logo/SiteLogo'

const Custom500 = () => {
  return (
    <>
      <MetaTags title="Something wrong" />
      <div className="mx-auto max-w-screen-lg px-4">
        <div className="mt-32">
          <SiteLogo />

          <div className="mt-8 flex items-center gap-1">
            <span className="font-bold">500.</span>
            <span>That&apos;s an error.</span>
          </div>

          <p className="mt-4 text-muted-foreground">
            There was an error. Please try again later. That&apos;s all we know.
          </p>

          <Button size="lg" className="mt-6" asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </>
  )
}

export default Custom500
