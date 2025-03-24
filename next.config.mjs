/** @type {import('next').NextConfig} */
import cron from 'node-cron';
import axios from 'axios';

const baseUrl =
  process.env.NEXT_PUBLIC_ENVIRONMENT === 'development'
    ? 'http://127.0.0.1:8888/api/schedule/'
    : 'https://cryptopayserver.xyz/api/schedule/';

// cron.schedule('*/60 * * * * *', async () => {
//   try {
//     await axios.get(baseUrl + 'schedule_invoice_expired');
//   } catch (e) {
//     // console.error(e);
//   }
// });

// cron.schedule('*/10 * * * * *', async () => {
//   try {
//     await axios.get(baseUrl + 'schedule_blockscan');
//   } catch (e) {
//     // console.error(e);
//   }
// });

// cron.schedule('*/60 * * * * *', async () => {
//   try {
//     await axios.get(baseUrl + 'schedule_pull_payment_expired');
//   } catch (e) {
//     // console.error(e);
//   }
// });

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@mui/x-charts', '@mui/x-date-pickers'],
};

export default nextConfig;
