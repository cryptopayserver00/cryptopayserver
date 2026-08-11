import { FC } from 'react';
import Head from 'next/head';
import { APP_DESCRIPTION, APP_NAME } from '@/packages/constants';
import { useRouter } from 'next/router';

type Props = {
  title?: string;
};

const MetaTags: FC<Props> = (props) => {
  const router = useRouter();
  const { title } = props;

  const meta = {
    title: title ? `${title} • ${APP_NAME}` : APP_NAME,
    description: APP_DESCRIPTION,
    type: 'website',
  };

  return (
    <Head>
      <title>{meta.title}</title>
      <meta name="robots" content="follow, index" />
      <meta content={meta.description} name="description" />
      <meta
        name="viewport"
        content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, maximum-scale=5, viewport-fit=cover"
      />
      {/* <link rel="canonical" href={`https://example.com${router.asPath}`} /> */}
      {/* <meta property="og:url" content={`https://example.com${router.asPath}`} /> */}
      <meta property="og:type" content={meta.type} />
      <meta property="og:site_name" content={APP_NAME} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:image:width" content="400" />
      <meta property="og:image:height" content="400" />
    </Head>
  );
};

export default MetaTags;
