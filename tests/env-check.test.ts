import { describe, expect, it } from 'vitest'
import { checkSecurityEnv } from '../src/lib/security/env-check'

describe('checkSecurityEnv', () => {
  it('errors on weak secrets in production', () => {
    const issues = checkSecurityEnv({
      NODE_ENV: 'production',
      SESSION_SECRET: 'too-short',
      ENCRYPTION_KEY: 'also-too-short',
      CRON_SECRET: 'tiny',
      DATABASE_URL: '',
      APP_BASE_URL: '',
    } as NodeJS.ProcessEnv)

    expect(issues.some((i) => i.level === 'error' && i.message.includes('SESSION_SECRET'))).toBe(
      true
    )
    expect(issues.some((i) => i.level === 'error' && i.message.includes('ENCRYPTION_KEY'))).toBe(
      true
    )
    expect(issues.some((i) => i.level === 'error' && i.message.includes('CRON_SECRET'))).toBe(true)
    expect(issues.some((i) => i.level === 'error' && i.message.includes('APP_BASE_URL'))).toBe(
      true
    )
    expect(issues.some((i) => i.level === 'error' && i.message.includes('DATABASE_URL'))).toBe(
      true
    )
  })

  it('passes with strong production config', () => {
    const issues = checkSecurityEnv({
      NODE_ENV: 'production',
      SESSION_SECRET: 'a'.repeat(32) + '-session',
      ENCRYPTION_KEY: 'b'.repeat(32) + '-encrypt',
      CRON_SECRET: 'c'.repeat(16) + '-cron',
      DATABASE_URL: 'mysql://u:p@localhost:3306/db',
      APP_BASE_URL: 'https://pay.example.com',
      REDIS_URL: 'redis://127.0.0.1:6379/0',
      BLOCKSCAN_BASE_URL: 'https://blockscan.example/api',
    } as NodeJS.ProcessEnv)

    expect(issues.filter((i) => i.level === 'error')).toEqual([])
  })

  it('warns when registration disable flags disagree', () => {
    const issues = checkSecurityEnv({
      NODE_ENV: 'development',
      DISABLE_PUBLIC_REGISTRATION: 'true',
      NEXT_PUBLIC_DISABLE_PUBLIC_REGISTRATION: 'false',
    } as NodeJS.ProcessEnv)

    expect(
      issues.some((i) => i.message.includes('NEXT_PUBLIC_DISABLE_PUBLIC_REGISTRATION'))
    ).toBe(true)
  })

  it('flags identical SESSION and CRON secrets', () => {
    const shared = 'same-secret-value-32chars-ok!!'
    const issues = checkSecurityEnv({
      NODE_ENV: 'production',
      SESSION_SECRET: shared,
      ENCRYPTION_KEY: 'other-encryption-key-32chars!!',
      CRON_SECRET: shared,
      DATABASE_URL: 'mysql://u:p@localhost:3306/db',
      APP_BASE_URL: 'https://pay.example.com',
      REDIS_URL: 'redis://127.0.0.1:6379/0',
      BLOCKSCAN_BASE_URL: 'https://blockscan.example/api',
    } as NodeJS.ProcessEnv)

    expect(
      issues.some((i) => i.message.includes('SESSION_SECRET and CRON_SECRET'))
    ).toBe(true)
  })

  it('errors when REQUIRE_REDIS=true and REDIS_URL missing in production', () => {
    const issues = checkSecurityEnv({
      NODE_ENV: 'production',
      SESSION_SECRET: 'a'.repeat(32) + '-session',
      ENCRYPTION_KEY: 'b'.repeat(32) + '-encrypt',
      CRON_SECRET: 'c'.repeat(16) + '-cron',
      DATABASE_URL: 'mysql://u:p@localhost:3306/db',
      APP_BASE_URL: 'https://pay.example.com',
      REQUIRE_REDIS: 'true',
      BLOCKSCAN_BASE_URL: 'https://blockscan.example/api',
    } as NodeJS.ProcessEnv)

    expect(issues.some((i) => i.level === 'error' && i.message.includes('REDIS_URL'))).toBe(true)
  })
})
