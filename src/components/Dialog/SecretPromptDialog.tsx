import { FormEvent, useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSecretPromptStore } from '@/lib/store/secret-prompt'

export default function SecretPromptDialog() {
  const { open, pending, settle } = useSecretPromptStore(
    useShallow((state) => ({
      open: state.open,
      pending: state.pending,
      settle: state.settle,
    }))
  )
  const [values, setValues] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open || !pending) {
      setValues({})
      return
    }
    const next: Record<string, string> = {}
    for (const field of pending.fields) {
      next[field.id] = ''
    }
    setValues(next)
  }, [open, pending])

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!pending) return
    for (const field of pending.fields) {
      if (!String(values[field.id] || '').trim()) {
        return
      }
    }
    settle(values)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) settle(null)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{pending?.title || 'Confirm'}</DialogTitle>
          {pending?.description ? (
            <DialogDescription>{pending.description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          {pending?.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={`secret-prompt-${field.id}`}>{field.label}</Label>
              <Input
                id={`secret-prompt-${field.id}`}
                type={field.type || 'password'}
                autoComplete={field.autoComplete || 'current-password'}
                placeholder={field.placeholder}
                value={values[field.id] || ''}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    [field.id]: e.target.value,
                  }))
                }
                autoFocus={field.id === pending.fields[0]?.id}
              />
            </div>
          ))}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => settle(null)}>
              Cancel
            </Button>
            <Button type="submit">{pending?.confirmLabel || 'Continue'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
