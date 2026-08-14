import Document, { Html, Head, Main, NextScript } from 'next/document'
import { APP_NAME, STATIC_ASSETS } from '@/packages/constants'
import { Http } from '@/utils/http/http'

export default function MyDocument(props: any) {
  return (
    <Html lang="en">
      <Head>
        {/* <DocumentHeadTags {...props} /> */}
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <link rel="icon" href={`${Http.httpClient}/favicon.ico`} type="image/x-icon" />
        <link rel="shortcut icon" href={`${Http.httpClient}/favicon.ico`} />
        <meta name="theme-color" content="#ffffff" />
        <link rel="manifest" href={`${Http.httpClient}/manifest.json`} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={APP_NAME} />
      </Head>
      <body style={{ backgroundColor: '#f8f9fa' }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
