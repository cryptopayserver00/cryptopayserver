import '@/utils/i18n'
import '@/styles/globals.css'
import '@/styles/index.css'
import '@/styles/theme.config.css'

import Providers from '@/components/Common/Providers'
import type { AppProps } from 'next/app'
import { Suspense } from 'react'

const MyApp = ({ Component, pageProps, cookies }: AppProps & { cookies: string | null }) => {
  return (
    <Suspense fallback="loading">
      <Providers cookies={cookies}>
        <Component {...pageProps} />
      </Providers>
    </Suspense>
  )
}

export default MyApp
