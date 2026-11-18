import { describe, expect, it } from 'vitest'
import { webhookRetryDelayMs } from '../src/utils/webhook'

describe('webhookRetryDelayMs', () => {
  it('uses increasing backoff and caps at the last bucket', () => {
    expect(webhookRetryDelayMs(1)).toBe(60_000)
    expect(webhookRetryDelayMs(2)).toBe(5 * 60_000)
    expect(webhookRetryDelayMs(5)).toBe(6 * 60 * 60_000)
    expect(webhookRetryDelayMs(99)).toBe(6 * 60 * 60_000)
  })
})
