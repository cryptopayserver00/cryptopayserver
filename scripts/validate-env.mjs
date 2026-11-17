#!/usr/bin/env node
/**
 * Validate security-critical environment variables.
 *
 * Usage:
 *   node --env-file=.env scripts/validate-env.mjs
 *   NODE_ENV=production node --env-file=.env.production scripts/validate-env.mjs
 *
 * Exit 1 when any error-level issue is present.
 */
const WEAK = new Set([
  '',
  'changeme',
  'secret',
  'password',
  'SESSION_SECRET',
  'ENCRYPTION_KEY',
  'CRON_SECRET',
  'your-secret-here',
])

function isWeak(value, minLen) {
  const v = String(value || '').trim()
  if (v.length < minLen) return true
  if (WEAK.has(v)) return true
  if (/^(.)\1+$/.test(v)) return true
  return false
}

const env = process.env
const production = env.NODE_ENV === 'production'
/** @type {{ level: 'error' | 'warn', message: string }[]} */
const issues = []

function push(level, message) {
  issues.push({ level, message })
}

if (isWeak(env.SESSION_SECRET, 32)) {
  push(production ? 'error' : 'warn', 'SESSION_SECRET must be a strong random string (≥ 32 chars)')
}
if (isWeak(env.ENCRYPTION_KEY, 32)) {
  push(production ? 'error' : 'warn', 'ENCRYPTION_KEY must be a strong random string (≥ 32 chars)')
}
if (isWeak(env.CRON_SECRET, 16)) {
  push(production ? 'error' : 'warn', 'CRON_SECRET must be a strong random string (≥ 16 chars)')
}
if (env.SESSION_SECRET && env.CRON_SECRET && env.SESSION_SECRET === env.CRON_SECRET) {
  push(production ? 'error' : 'warn', 'SESSION_SECRET and CRON_SECRET must be different values')
}
if (env.SESSION_SECRET && env.ENCRYPTION_KEY && env.SESSION_SECRET === env.ENCRYPTION_KEY) {
  push(production ? 'error' : 'warn', 'SESSION_SECRET and ENCRYPTION_KEY must be different values')
}

const base = String(env.APP_BASE_URL || env.NEXT_PUBLIC_APP_URL || '').trim()
if (production && !base) {
  push('error', 'APP_BASE_URL (or NEXT_PUBLIC_APP_URL) is required in production')
} else if (base) {
  try {
    // eslint-disable-next-line no-new
    new URL(base)
  } catch {
    push(production ? 'error' : 'warn', 'APP_BASE_URL is not a valid URL')
  }
}

if (!env.DATABASE_URL) {
  push(production ? 'error' : 'warn', 'DATABASE_URL is required')
}

if (production && !(env.REDIS_URL || '').trim()) {
  push('warn', 'REDIS_URL unset — rate limiting is per-process only')
}

if (
  production &&
  (env.ALLOW_LEGACY_PLAINTEXT_API_KEYS === 'true' ||
    env.ALLOW_LEGACY_PLAINTEXT_API_KEYS === '1')
) {
  push(
    'warn',
    'ALLOW_LEGACY_PLAINTEXT_API_KEYS is set but ignored in production — rotate/rehash keys instead'
  )
}

for (const issue of issues) {
  const line = `[env-check] ${issue.level}: ${issue.message}`
  if (issue.level === 'error') console.error(line)
  else console.warn(line)
}

const errors = issues.filter((i) => i.level === 'error')
if (errors.length === 0 && issues.every((i) => i.level !== 'error')) {
  if (issues.length === 0) console.log('[env-check] ok')
}

if (errors.length > 0) {
  process.exitCode = 1
}
