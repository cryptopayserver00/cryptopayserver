import { Button } from '@/components/ui/button'
import { useSnackPresistStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'

const Forms = () => {
  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      setSnackSeverity: state.setSnackSeverity,
      setSnackMessage: state.setSnackMessage,
      setSnackOpen: state.setSnackOpen,
    }))
  )
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">Forms</h3>
        <Button
          onClick={() => {
            setSnackSeverity('warning')
            setSnackMessage('no support right now!')
            setSnackOpen(true)
          }}
        >
          Create Form
        </Button>
      </div>

      <p className="text-sm text-muted-foreground pt-4">There are no forms yet.</p>
    </div>
  )
}

export default Forms
