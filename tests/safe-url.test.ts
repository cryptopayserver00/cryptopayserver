import { describe, expect, it } from 'vitest'
import { assertSafeHttpUrl, isBlockedWebhookHostname } from '@/lib/security/safe-url'

describe('safe-url', () => {
  it('blocks private hostnames', () => {
    expect(isBlockedWebhookHostname('localhost')).toBe(true)
    expect(isBlockedWebhookHostname('127.0.0.1')).toBe(true)
    expect(isBlockedWebhookHostname('10.0.0.5')).toBe(true)
    expect(isBlockedWebhookHostname('192.168.1.1')).toBe(true)
    expect(isBlockedWebhookHostname('169.254.169.254')).toBe(true)
    expect(isBlockedWebhookHostname('example.com')).toBe(false)
  })

  it('rejects http and credentialed urls', async () => {
    const http = await assertSafeHttpUrl('http://example.com/hook', { resolveDns: false })
    expect(http.ok).toBe(false)

    const creds = await assertSafeHttpUrl('https://user:pass@example.com/hook', {
      resolveDns: false,
    })
    expect(creds.ok).toBe(false)

    const ok = await assertSafeHttpUrl('https://example.com/hook', { resolveDns: false })
    expect(ok.ok).toBe(true)
  })
})
