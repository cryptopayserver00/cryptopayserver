import { describe, expect, it, beforeEach } from 'vitest'
import { useSecretPromptStore } from '@/lib/store/secret-prompt'

describe('secret-prompt store', () => {
  beforeEach(() => {
    useSecretPromptStore.setState({ open: false, pending: null })
  })

  it('resolves with field values on settle', async () => {
    const promise = useSecretPromptStore.getState().requestSecret({
      title: 'Test',
      fields: [{ id: 'password', label: 'Password' }],
    })
    expect(useSecretPromptStore.getState().open).toBe(true)
    useSecretPromptStore.getState().settle({ password: 'secret' })
    await expect(promise).resolves.toEqual({ password: 'secret' })
    expect(useSecretPromptStore.getState().open).toBe(false)
  })

  it('resolves null when cancelled', async () => {
    const promise = useSecretPromptStore.getState().requestSecret({
      title: 'Test',
      fields: [{ id: 'password', label: 'Password' }],
    })
    useSecretPromptStore.getState().settle(null)
    await expect(promise).resolves.toBeNull()
  })
})
