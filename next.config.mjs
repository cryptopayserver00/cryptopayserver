/** @type {import('next').NextConfig} */
import cron from 'node-cron';

cron.schedule('*/5 * * * * *', function () {
  console.log('Say scheduled hello');
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@mui/x-charts', '@mui/x-date-pickers'],
};

export default nextConfig;
