import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const AccessToken = () => {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">
          Greenfield API Keys
        </h3>
        <p className="text-sm text-muted-foreground">
          To generate Greenfield API keys, please{' '}
          <Link href="/account?tab=apikeys" className="text-primary underline hover:opacity-80">
            click here.
          </Link>
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold tracking-tight text-foreground">Access Tokens</h3>
          <Button size="lg">Create Token</Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Authorize a public key to access Bitpay compatible Invoice API.
        </p>
        <p className="text-sm text-muted-foreground font-medium">No access tokens yet.</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">Legacy API Keys</h3>
        <p className="text-sm text-muted-foreground">
          Alternatively, you can use the invoice API by including the following HTTP Header in your
          requests:
        </p>
        <p className="text-sm font-bold font-mono bg-muted p-2.5 rounded-md inline-block">
          Authorization: Basic *API Key*
        </p>

        <div className="space-y-2 max-w-xl pt-2">
          <Label htmlFor="legacy-api-key">API Key</Label>
          <div className="flex items-center gap-3">
            <Input
              id="legacy-api-key"
              disabled
              placeholder="Generate key to view..."
              className="font-mono"
            />
            <Button size="lg" className="shrink-0">
              Generate
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccessToken
