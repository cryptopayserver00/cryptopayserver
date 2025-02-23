import '../styles/index.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import Providers from 'components/Common/Providers';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';

const MyApp = ({ Component, pageProps }: AppProps) => {
  async function test_db_conn() {
    try {
      const response: any = await axios.get(Http.test_db_conn);
      if (response.result) {
        // console.log('Test DB connection successfully');
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function init() {
    // await test_db_conn();
  }

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Providers>
      <Component {...pageProps} />
    </Providers>
  );
};

export default MyApp;
