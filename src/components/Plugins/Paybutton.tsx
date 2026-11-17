import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export const Paybutton = () => {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
      <div className="pb-4 border-b">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Pay Button</h1>
      </div>

      <Alert>
        <AlertDescription>
          Pay Button embed generation is planned for a later release. Use invoices or payment
          requests for checkout links in this beta.
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Configure your Pay Button, and the generated code will be displayed at the bottom of the
            page to copy into your project.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default Paybutton
