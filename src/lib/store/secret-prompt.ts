import { create } from 'zustand'

export type SecretPromptField = {
  id: string
  label: string
  type?: 'password' | 'text'
  placeholder?: string
  autoComplete?: string
}

type PendingPrompt = {
  title: string
  description?: string
  fields: SecretPromptField[]
  confirmLabel?: string
  resolve: (value: Record<string, string> | null) => void
}

type SecretPromptState = {
  open: boolean
  pending: PendingPrompt | null
  requestSecret: (opts: {
    title: string
    description?: string
    fields: SecretPromptField[]
    confirmLabel?: string
  }) => Promise<Record<string, string> | null>
  settle: (value: Record<string, string> | null) => void
}

export const useSecretPromptStore = create<SecretPromptState>((set, get) => ({
  open: false,
  pending: null,
  requestSecret: ({ title, description, fields, confirmLabel }) => {
    return new Promise((resolve) => {
      const current = get().pending
      if (current) {
        current.resolve(null)
      }
      set({
        open: true,
        pending: { title, description, fields, confirmLabel, resolve },
      })
    })
  },
  settle: (value) => {
    const pending = get().pending
    if (pending) pending.resolve(value)
    set({ open: false, pending: null })
  },
}))

export function requestSecretPrompt(opts: {
  title: string
  description?: string
  fields: SecretPromptField[]
  confirmLabel?: string
}): Promise<Record<string, string> | null> {
  return useSecretPromptStore.getState().requestSecret(opts)
}
