import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Key, Plus, ArrowLeft, Trash2, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store'
import { APIKEYPERMISSIONS, APIKEYPERMISSION } from '@/packages/constants'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { useShallow } from 'zustand/react/shallow'

const ApiKey = () => {
  const [page, setPage] = useState<number>(1)
  const [label, setLabel] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [permissions, setPermissions] = useState<APIKEYPERMISSION[]>(APIKEYPERMISSIONS)

  const { userId } = useUserPresistStore(
    useShallow((state) => ({
      userId: state.userId,
    }))
  )

  const { storeId } = useStorePresistStore(
    useShallow((state) => ({
      storeId: state.storeId,
    }))
  )

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      setSnackSeverity: state.setSnackSeverity,
      setSnackMessage: state.setSnackMessage,
      setSnackOpen: state.setSnackOpen,
    }))
  )

  const onClickGenerateAPIKEY = async () => {
    try {
      if (!label || !permissions || permissions.length === 0) {
        return
      }

      const ids = permissions.filter((item) => item.status).map((item) => item.id)

      if (ids.length === 0) {
        setSnackSeverity('error')
        setSnackMessage('Please turn on at least one permissions!')
        setSnackOpen(true)
        return
      }

      setIsGenerating(true)

      const response: any = await axios.post(Http.create_apikey_setting, {
        user_id: userId,
        store_id: storeId,
        label: label,
        permissions: ids.join(','),
      })

      if (response.result) {
        setSnackSeverity('success')
        setSnackMessage('Save successful!')
        setSnackOpen(true)

        clearData()
        setPage(1)
      } else {
        setSnackSeverity('error')
        setSnackMessage('Save failed!')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    } finally {
      setIsGenerating(false)
    }
  }

  const clearData = () => {
    setLabel('')
    setPermissions(() =>
      APIKEYPERMISSIONS.map((item) => ({
        ...item,
        status: false,
      }))
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {page === 1 && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">API Keys</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage programmatic access to your instance
              </p>
            </div>
            <Button onClick={() => setPage(2)} className="gap-2">
              <Plus className="h-4 w-4" />
              Generate Key
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                The{' '}
                <Link
                  href="#"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Greenfield API
                </Link>{' '}
                offers programmatic access to your instance. You can manage your CryptoPay Server
                (e.g. stores, invoices, users) as well as automate workflows and integrations (see{' '}
                <Link
                  href="#"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  use case examples
                </Link>
                ). For that you need the API keys, which can be generated here. Find more
                information in the{' '}
                <Link
                  href="#"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  API authentication docs
                </Link>
                .
              </p>
            </CardContent>
          </Card>

          <AccountApiKeyTable />
        </>
      )}

      {page === 2 && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Generate API Key</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Create a new key to access CryptoPay through its API
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  clearData()
                  setPage(1)
                }}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button onClick={onClickGenerateAPIKEY} disabled={isGenerating} className="gap-2">
                <Key className="h-4 w-4" />
                {isGenerating ? 'Generating...' : 'Generate API Key'}
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Key details</CardTitle>
              <CardDescription>
                Give your key a label and select the permissions it should have
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Production server, CI pipeline..."
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Permissions</Label>
                <p className="text-sm text-muted-foreground">
                  Select at least one permission for this API key
                </p>

                <div className="space-y-3 pt-1">
                  {permissions.map((item, index) => (
                    <div
                      key={item.id ?? index}
                      className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/40"
                    >
                      <Checkbox
                        id={`perm-${index}`}
                        checked={item.status}
                        onCheckedChange={() => {
                          const newPermissions = [...permissions]
                          newPermissions[index].status = !newPermissions[index].status
                          setPermissions(newPermissions)
                        }}
                        className="mt-0.5"
                      />
                      <div className="space-y-1 leading-none">
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor={`perm-${index}`}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {item.title}
                          </label>
                          <Badge variant="secondary" className="text-xs font-normal">
                            {item.tag}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default ApiKey

type RowType = {
  id: number
  label: string
  key: string
  permissions: string[]
}

function AccountApiKeyTable() {
  const [rows, setRows] = useState<RowType[]>([])
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const { userId } = useUserPresistStore(
    useShallow((state) => ({
      userId: state.userId,
    }))
  )

  const { storeId } = useStorePresistStore(
    useShallow((state) => ({
      storeId: state.storeId,
    }))
  )

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      setSnackSeverity: state.setSnackSeverity,
      setSnackMessage: state.setSnackMessage,
      setSnackOpen: state.setSnackOpen,
    }))
  )

  const init = async (userId: number, storeId: number) => {
    try {
      const response: any = await axios.get(Http.find_apikey_setting, {
        params: {
          user_id: userId,
          store_id: storeId,
        },
      })

      if (response.result) {
        const rows: RowType[] = (response.data ?? []).map((item: any) => {
          const permissions = item.permissions
            ? item.permissions
                .split(',')
                .filter(Boolean) // 过滤空字符串
                .map((i: string) => APIKEYPERMISSIONS[parseInt(i, 10) + 1]?.tag)
                .filter(Boolean) // 过滤无效权限
            : []

          return {
            id: item.id,
            label: item.label,
            key: item.apiKey,
            permissions,
          }
        })
        setRows(rows)
      } else {
        setSnackSeverity('error')
        setSnackMessage('Can not find the data on site!')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  useEffect(() => {
    init(userId, storeId)
  }, [userId, storeId])

  const onClickDelete = async (id: number) => {
    try {
      setDeletingId(id)
      const response: any = await axios.put(Http.delete_apikey_setting_by_id, {
        id: id,
      })

      if (response.result) {
        setSnackSeverity('success')
        setSnackMessage('Delete successful!')
        setSnackOpen(true)
        await init(userId, storeId)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    } finally {
      setDeletingId(null)
    }
  }

  const copyToClipboard = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      setSnackSeverity('error')
      setSnackMessage('Failed to copy')
      setSnackOpen(true)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Your API Keys</CardTitle>
        <CardDescription>
          {rows.length > 0
            ? `${rows.length} key${rows.length > 1 ? 's' : ''} created`
            : 'No API keys yet'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Label</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="text-right w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows && rows.length > 0 ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.label}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 max-w-xs">
                      <code className="truncate text-xs bg-muted px-2 py-1 rounded font-mono">
                        {row.key}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => copyToClipboard(row.key, row.id)}
                      >
                        {copiedId === row.id ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {row.permissions?.map((perm, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {perm}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                      disabled={deletingId === row.id}
                      onClick={() => onClickDelete(row.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {deletingId === row.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Key className="h-8 w-8 opacity-40" />
                    <p className="text-sm">No API keys found</p>
                    <p className="text-xs">Generate your first key to get started</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
