import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Pointofsale = () => {
  const [appName, setAppName] = useState<string>('')
  const [showError, setShowError] = useState<boolean>(false)

  const handleCreate = () => {
    if (!appName.trim()) {
      setShowError(true)
      return
    }
    setShowError(false)

    console.log('Creating PointOfSale:', appName)
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
      <div className="pb-4 border-b">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Create a new PointOfSale
        </h1>
      </div>

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
