import { FC } from 'react'
import Head from 'next/head'
import { APP_DESCRIPTION, APP_NAME } from '@/packages/constants'
import { useRouter } from 'next/router'
import { Http } from '@/utils/http/http'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || Http.httpClient
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg` // 1200x630

type Props = {
  title?: string
  description?: string
  image?: string
  type?: 'website' | 'invoice' | 'order'
  noIndex?: boolean
  canonicalPath?: string
}

const MetaTags: FC<Props> = ({
  title,
  description,
  image,
  type = 'website',
  noIndex = false,
  canonicalPath,
}) => {
  const router = useRouter()

  const metaTitle = title ? `${title} | ${APP_NAME}` : APP_NAME
  const metaDescription = description || APP_DESCRIPTION
  const metaImage = image
    ? image.startsWith('http')
      ? image
      : `${SITE_URL}${image.startsWith('/') ? '' : '/'}${image}`
    : DEFAULT_OG_IMAGE

  const path = canonicalPath ?? router.asPath.split('?')[0]
  const canonicalUrl = `${SITE_URL}${path === '/' ? '' : path}`

  return (
    <Head>
      {/* Primary */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover"
      />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={APP_NAME} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* Optional brand */}
      <meta name="application-name" content={APP_NAME} />
      {/* <meta name="theme-color" content="#f8f9fa" /> */}
    </Head>
  )
}

export default MetaTags
