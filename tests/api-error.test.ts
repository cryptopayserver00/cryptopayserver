import { describe, expect, it } from 'vitest'
import { getApiErrorMessage } from '../src/utils/http/api-error'

describe('getApiErrorMessage', () => {
  it('prefers response body message', () => {
    expect(
      getApiErrorMessage({
        response: { status: 429, data: { message: 'Too many requests', result: false } },
      })
    ).toBe('Too many requests')
  })

  it('falls back for 429 without body message', () => {
    expect(getApiErrorMessage({ response: { status: 429, data: {} } })).toMatch(/Too many requests/)
  })

  it('uses default fallback', () => {
    expect(getApiErrorMessage(new Error('Request failed with status code 500'))).toMatch(
      /network error/i
    )
  })
})
