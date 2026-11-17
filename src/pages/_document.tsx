import Document, {
  Html,
  Head,
  Main,
  NextScript,
  type DocumentContext,
  type DocumentInitialProps,
} from 'next/document'
import { APP_NAME } from '@/packages/constants'

type Props = DocumentInitialProps & { nonce?: string }

export default class MyDocument extends Document<Props> {
  static async getInitialProps(ctx: DocumentContext): Promise<Props> {
    const initialProps = await Document.getInitialProps(ctx)
    const headerNonce = ctx.req?.headers['x-nonce']
    const nonce = Array.isArray(headerNonce) ? headerNonce[0] : headerNonce
    return {
      ...initialProps,
      nonce: typeof nonce === 'string' && nonce ? nonce : undefined,
    }
  }

  render() {
    const { nonce } = this.props
    return (
      <Html lang="en">
        <Head nonce={nonce}>
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <link rel="icon" href={'/favicon.ico'} type="image/x-icon" />
          <link rel="shortcut icon" href={'/favicon.ico'} />
          <meta name="theme-color" content="#ffffff" />
          <link rel="manifest" href={'/manifest.json'} />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content={APP_NAME} />
        </Head>
        <body className="bg-[#f8f9fa]">
          <Main />
          <NextScript nonce={nonce} />
        </body>
      </Html>
    )
  }
}
