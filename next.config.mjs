/** @type {import('next').NextConfig} */

const nextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  serverExternalPackages: ['@walletconnect/logger'],
  output: 'standalone',

  reactStrictMode: true,
  // Do not allow arbitrary remote image optimization (SSRF via /_next/image).
  // Prefer same-origin /uploads; external logos should use <img> or be allowlisted.
  images: {
    remotePatterns: [],
    unoptimized: false,
  },

  async headers() {
    // CSP is set per-request in middleware.ts with a script nonce (no static unsafe-inline for scripts).
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
      },
      { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
      { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
    ]

    // HSTS only when serving over HTTPS (production / FORCE_SECURE_COOKIES / https APP_BASE_URL).
    const forceSecure =
      process.env.FORCE_SECURE_COOKIES === 'true' ||
      process.env.FORCE_SECURE_COOKIES === '1' ||
      process.env.NODE_ENV === 'production'
    let httpsBase = false
    try {
      const base = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || ''
      httpsBase = new URL(base).protocol === 'https:'
    } catch {
      httpsBase = false
    }
    if (forceSecure || httpsBase) {
      securityHeaders.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      })
    }

    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
