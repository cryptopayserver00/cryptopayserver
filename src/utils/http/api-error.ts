/** Extract a user-facing message from axios / fetch failures. */
export function getApiErrorMessage(
  error: unknown,
  fallback = 'The network error occurred. Please try again later.'
): string {
  if (!error || typeof error !== 'object') return fallback

  const anyErr = error as {
    response?: { data?: { message?: unknown }; status?: number }
    message?: unknown
  }

  const fromBody = anyErr.response?.data?.message
  if (typeof fromBody === 'string' && fromBody.trim()) return fromBody.trim()

  if (anyErr.response?.status === 429) return 'Too many requests. Please try again later.'
  if (anyErr.response?.status === 403) return 'Forbidden'
  if (typeof anyErr.message === 'string' && anyErr.message && !anyErr.message.startsWith('Request failed')) {
    return anyErr.message
  }

  return fallback
}
