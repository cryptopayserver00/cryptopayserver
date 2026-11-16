export const SESSION_COOKIE_NAME = 'cps_session'
export const PENDING_2FA_COOKIE_NAME = 'cps_pending_2fa'
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
