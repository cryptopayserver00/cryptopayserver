import { describe, expect, it } from 'vitest'
import { createHmac } from 'crypto'
import { WEBHOOK } from '../src/utils/webhook'

describe('WEBHOOK.signPayload', () => {
  it('matches HMAC-SHA256 of timestamp.body', () => {
    const secret = 'test-webhook-secret'
    const timestamp = '1710000000'
    const rawBody = JSON.stringify({ event: 'invoice.updated', data: { id: 1 } })
    const expected = createHmac('sha256', secret)
      .update(`${timestamp}.${rawBody}`)
      .digest('hex')

    expect(WEBHOOK.signPayload(secret, timestamp, rawBody)).toBe(expected)
  })
})
