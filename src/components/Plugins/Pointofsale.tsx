import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useSnackPresistStore } from '@/lib/store'

export const Pointofsale = () => {
  const [appName, setAppName] = useState<string>('')
  const [showError, setShowError] = useState<boolean>(false)
  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      setSnackSeverity: state.setSnackSeverity,
      setSnackMessage: state.setSnackMessage,
      setSnackOpen: state.setSnackOpen,
    }))
  )

  const handleCreate = () => {
    if (!appName.trim()) {
      setShowError(true)
      return
    }
    setShowError(false)
    setSnackSeverity('error')
    setSnackMessage('Point of Sale apps are not available yet in this beta build.')
    setSnackOpen(true)
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
      <div className="pb-4 border-b">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Create a new PointOfSale
        </h1>
      </div>

      <Alert>
        <AlertDescription>
          Point of Sale is planned for a later release. You can draft an app name, but creation is
          disabled in this beta.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Point of Sale Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pos-app-name" className="flex items-center gap-0.5">
              App Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="pos-app-name"
              placeholder="Enter Point of Sale app name"
              value={appName}
              onChange={(e) => {
                setAppName(e.target.value)
                if (showError && e.target.value.trim()) {
                  setShowError(false)
                }
              }}
            />
            {showError && (
              <p className="text-xs text-destructive font-medium mt-1">
                The App Name field is required.
              </p>
            )}
          </div>

          <div className="pt-2">
            <Button size="lg" onClick={handleCreate} className="w-full sm:w-auto">
              Create
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Pointofsale
