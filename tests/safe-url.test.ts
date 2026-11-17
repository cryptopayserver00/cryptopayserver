import { describe, expect, it } from 'vitest'
import {
  assertSafeHttpUrl,
  isBlockedWebhookHostname,
  sanitizePublicWebsiteUrl,
  sanitizeStoreCustomCssUrl,
  sanitizeStoreLogoUrl,
} from '@/lib/security/safe-url'

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

  it('sanitizes public website links', () => {
    expect(sanitizePublicWebsiteUrl('javascript:alert(1)')).toBe('')
    expect(sanitizePublicWebsiteUrl('data:text/html,hi')).toBe('')
    expect(sanitizePublicWebsiteUrl('https://user:pass@evil.com')).toBe('')
    expect(sanitizePublicWebsiteUrl('https://shop.example/')).toContain('https://shop.example')
    expect(sanitizePublicWebsiteUrl('http://localhost:3000')).toContain('http://localhost:3000')
  })

  it('sanitizes store custom css urls', () => {
    expect(sanitizeStoreCustomCssUrl('/uploads/image/1/brand.css')).toBe('/uploads/image/1/brand.css')
    expect(sanitizeStoreCustomCssUrl('/uploads/image/1/../2/x.css')).toBe('')
    expect(sanitizeStoreCustomCssUrl('https://evil.com/x.css')).toBe('')
    expect(sanitizeStoreCustomCssUrl('/uploads/image/1/brand.png')).toBe('')
    expect(sanitizeStoreCustomCssUrl('/api/tool/download_file?name=x.css')).toBe('')
  })

  it('sanitizes store logo urls', () => {
    expect(sanitizeStoreLogoUrl('/uploads/image/9/logo.png')).toBe('/uploads/image/9/logo.png')
    expect(sanitizeStoreLogoUrl('/uploads/image/9/logo.css')).toBe('')
    expect(sanitizeStoreLogoUrl('https://cdn.evil/logo.png')).toBe('')
  })
})
