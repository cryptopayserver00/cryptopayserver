/** Base cookie names (without __Host- prefix). */
export const SESSION_COOKIE_BASE_NAME = 'cps_session'
export const PENDING_2FA_COOKIE_BASE_NAME = 'cps_pending_2fa'

/**
 * Prefer USE_HOST_PREFIX_COOKIES=true on HTTPS apex hosts.
 * Requires Secure + Path=/ and forbids Domain (browser-enforced for __Host-).
 */
export function useHostPrefixCookies(): boolean {
  return (
    process.env.USE_HOST_PREFIX_COOKIES === 'true' ||
    process.env.USE_HOST_PREFIX_COOKIES === '1'
  )
}

export function getSessionCookieName(): string {
  return useHostPrefixCookies()
    ? `__Host-${SESSION_COOKIE_BASE_NAME}`
    : SESSION_COOKIE_BASE_NAME
}

export function getPending2faCookieName(): string {
  return useHostPrefixCookies()
    ? `__Host-${PENDING_2FA_COOKIE_BASE_NAME}`
    : PENDING_2FA_COOKIE_BASE_NAME
}

/** @deprecated Use getSessionCookieName() — kept for grep/docs; equals base name. */
export const SESSION_COOKIE_NAME = SESSION_COOKIE_BASE_NAME
/** @deprecated Use getPending2faCookieName() */
export const PENDING_2FA_COOKIE_NAME = PENDING_2FA_COOKIE_BASE_NAME

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days
export const PENDING_2FA_MAX_AGE_SECONDS = 60 * 5 // 5 minutes
export const PASSWORD_RESET_MAX_AGE_SECONDS = 60 * 15 // 15 minutes
export const CRON_HEADER_NAME = 'x-cron-secret'

/** API paths that do not require a logged-in session cookie. */
export const PUBLIC_API_PATHS = new Set([
  '/api/user/login',
  '/api/user/verify_2fa',
  '/api/user/create_user',
  '/api/user/send_reset_email',
  '/api/user/reset_password',
  '/api/user/logout',
  // Public checkout / payment pages
  '/api/invoice/find_invoice_by_id',
  '/api/invoice/find_invoice_by_source_type',
  '/api/invoice/create_invoice_from_external',
  '/api/paymentrequest/find_payment_request_by_id',
  '/api/pullpayment/find_pull_payment_by_id',
  '/api/payout/find_payout_by_source_type',
  '/api/payout/create_payout',
  '/api/tool/checkout_chain_address',
  '/api/tool/checkout_chain_address_status',
  '/api/tool/find_crypto_price',
])

export const SCHEDULE_API_PREFIX = '/api/schedule/'

/**
 * Paths that may authenticate with X-API-Key instead of a session cookie.
 * Middleware only skips the session gate for these routes when the header is present;
 * handlers must still call requireAuthOrApiKey / requireApiKey.
 */
export const API_KEY_API_PATHS = new Set([
  '/api/invoice/create_invoice',
])
