import '@/utils/i18n'
import '@/styles/globals.css'
import '@/styles/index.css'
import '@/styles/theme.config.css'

import Providers from '@/components/Common/Providers'
import App, { type AppContext, type AppProps } from 'next/app'
import { Suspense } from 'react'

type Props = AppProps & { cookies: string | null }

const MyApp = ({ Component, pageProps, cookies }: Props) => {
  return (
    <Suspense fallback="loading">
      <Providers cookies={cookies}>
        <Component {...pageProps} />
      </Providers>
    </Suspense>
  )
}

// Force per-request SSR so middleware CSP nonces can be applied in _document.
// Without this, Automatic Static Optimization leaves scripts without matching nonces → blank page.
MyApp.getInitialProps = async (appContext: AppContext) => {
  const appProps = await App.getInitialProps(appContext)
  const cookieHeader = appContext.ctx.req?.headers.cookie
  return {
    ...appProps,
    cookies: typeof cookieHeader === 'string' ? cookieHeader : null,
  }
}

export default MyApp
