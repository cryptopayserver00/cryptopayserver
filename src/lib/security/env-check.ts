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

function isWeak(value: string | undefined, minLen: number): boolean {
  const v = String(value || '').trim()
  if (v.length < minLen) return true
  if (WEAK.has(v)) return true
  if (/^(.)\1+$/.test(v)) return true // aaaaa...
  return false
}

export type EnvCheckIssue = { level: 'error' | 'warn'; message: string }

/** Validate security-critical env. Strict errors only in production. */
export function checkSecurityEnv(
  env: NodeJS.ProcessEnv = process.env
): EnvCheckIssue[] {
  const issues: EnvCheckIssue[] = []
  const production = env.NODE_ENV === 'production'

  if (isWeak(env.SESSION_SECRET, 32)) {
    issues.push({
      level: production ? 'error' : 'warn',
      message: 'SESSION_SECRET must be a strong random string (≥ 32 chars)',
    })
  }
  if (isWeak(env.ENCRYPTION_KEY, 32)) {
    issues.push({
      level: production ? 'error' : 'warn',
      message: 'ENCRYPTION_KEY must be a strong random string (≥ 32 chars)',
    })
  }
  if (isWeak(env.CRON_SECRET, 16)) {
    issues.push({
      level: production ? 'error' : 'warn',
      message: 'CRON_SECRET must be a strong random string (≥ 16 chars)',
    })
  }

  if (
    env.SESSION_SECRET &&
    env.CRON_SECRET &&
    env.SESSION_SECRET === env.CRON_SECRET
  ) {
    issues.push({
      level: production ? 'error' : 'warn',
      message: 'SESSION_SECRET and CRON_SECRET must be different values',
    })
  }

  if (
    env.SESSION_SECRET &&
    env.ENCRYPTION_KEY &&
    env.SESSION_SECRET === env.ENCRYPTION_KEY
  ) {
    issues.push({
      level: production ? 'error' : 'warn',
      message: 'SESSION_SECRET and ENCRYPTION_KEY must be different values',
    })
  }

  const base = String(env.APP_BASE_URL || env.NEXT_PUBLIC_APP_URL || '').trim()
  if (production && !base) {
    issues.push({
      level: 'error',
      message: 'APP_BASE_URL (or NEXT_PUBLIC_APP_URL) is required in production',
    })
  } else if (base) {
    try {
      const u = new URL(base)
      if (production && u.protocol !== 'https:' && u.hostname !== 'localhost' && u.hostname !== '127.0.0.1') {
        issues.push({
          level: 'warn',
          message: 'APP_BASE_URL should use https in production',
        })
      }
    } catch {
      issues.push({
        level: production ? 'error' : 'warn',
        message: 'APP_BASE_URL is not a valid URL',
      })
    }
  }

  if (
    production &&
    (env.ALLOW_LEGACY_PLAINTEXT_API_KEYS === 'true' ||
      env.ALLOW_LEGACY_PLAINTEXT_API_KEYS === '1')
  ) {
    issues.push({
      level: 'warn',
      message:
        'ALLOW_LEGACY_PLAINTEXT_API_KEYS is set but ignored in production — rotate/rehash keys instead',
    })
  }

  const requireRedis =
    env.REQUIRE_REDIS === 'true' ||
    env.REQUIRE_REDIS === '1' ||
    env.REQUIRE_REDIS_IN_PRODUCTION === 'true' ||
    env.REQUIRE_REDIS_IN_PRODUCTION === '1'

  if (!(env.REDIS_URL || '').trim()) {
    if (production && requireRedis) {
      issues.push({
        level: 'error',
        message:
          'REDIS_URL is required when REQUIRE_REDIS=true (multi-instance rate limits + cron locks)',
      })
    } else if (production) {
      issues.push({
        level: 'warn',
        message:
          'REDIS_URL unset — rate limits/cron locks are per-process only (set Redis + REQUIRE_REDIS=true for multi-instance)',
      })
    }
  }

  if (!(env.BLOCKSCAN_BASE_URL || '').trim()) {
    issues.push({
      level: production ? 'warn' : 'warn',
      message:
        'BLOCKSCAN_BASE_URL unset — on-chain invoice settlement / faucet / tx history will soft-fail until configured (see /api/health checks.blockscan)',
    })
  }

  const regDisabled = env.DISABLE_PUBLIC_REGISTRATION === 'true'
  const regUiDisabled = env.NEXT_PUBLIC_DISABLE_PUBLIC_REGISTRATION === 'true'
  if (regDisabled !== regUiDisabled) {
    issues.push({
      level: 'warn',
      message:
        'DISABLE_PUBLIC_REGISTRATION and NEXT_PUBLIC_DISABLE_PUBLIC_REGISTRATION should match (API vs Register UI)',
    })
  }

  if (!env.DATABASE_URL) {
    issues.push({
      level: production ? 'error' : 'warn',
      message: 'DATABASE_URL is required',
    })
  }

  return issues
}

/** Throw if any error-level issues (used at production boot). */
export function assertProductionEnv(env: NodeJS.ProcessEnv = process.env): void {
  const issues = checkSecurityEnv(env)
  for (const issue of issues) {
    const line = `[env-check] ${issue.level}: ${issue.message}`
    if (issue.level === 'error') console.error(line)
    else console.warn(line)
  }
  const errors = issues.filter((i) => i.level === 'error')
  if (errors.length > 0 && env.NODE_ENV === 'production') {
    throw new Error(
      `Invalid production environment (${errors.length} error(s)). Fix SESSION_SECRET / ENCRYPTION_KEY / CRON_SECRET / APP_BASE_URL / DATABASE_URL.`
    )
  }
}
