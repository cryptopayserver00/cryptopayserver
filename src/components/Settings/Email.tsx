import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, X, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store'
import { EMAIL_RULE_TIGGER_DATA, EMAIL_RULE_TIGGER_DATAS } from '@/packages/constants'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { IsValidEmail } from '@/utils/verify'
import { useShallow } from 'zustand/react/shallow'

const Emails = () => {
  const [page, setPage] = useState<number>(1)
  const [id, setId] = useState<number>(0)
  const [smtpServer, setSmtpServer] = useState<string>('')
  const [port, setPort] = useState<number>(0)
  const [senderEmailAddress, setSenderEmailAddress] = useState<string>('')
  const [login, setLogin] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [showTls, setShowTls] = useState<boolean>(false)
  const [testEmail, setTestEmail] = useState<string>('')

  const [ruleId, setRuleId] = useState<number>(0)
  const [trigger, setTrigger] = useState<EMAIL_RULE_TIGGER_DATA>()
  const [recipients, setRecipients] = useState<string>('')
  const [subject, setSubject] = useState<string>('')
  const [body, setBody] = useState<string>('')
  const [showSendToBuyer, setShowSendToBuyer] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)

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

  const clearData = () => {
    setRuleId(0)
    setTrigger(undefined)
    setRecipients('')
    setShowSendToBuyer(false)
    setSubject('')
    setBody('')
  }

  const onClickSaveRule = async () => {
    try {
      if (!trigger || !recipients || !subject || !body) {
        return
      }

      const emails = recipients.split(',')
      for (const item of emails) {
        if (!IsValidEmail(item.trim())) {
          setSnackSeverity('error')
          setSnackMessage('Incorrect email input')
          setSnackOpen(true)
          return
        }
      }

      if (ruleId && ruleId > 0) {
        const response: any = await axios.put(Http.update_email_rule_setting, {
          id: ruleId,
          trigger: trigger,
          recipients: recipients,
          show_send_to_buyer: showSendToBuyer ? 1 : 2,
          subject: subject,
          body: body,
        })

        if (response.result) {
          setSnackSeverity('success')
          setSnackMessage('Update successful!')
          setSnackOpen(true)

          await init(storeId, userId)
          setPage(2)
        } else {
          setSnackSeverity('error')
          setSnackMessage('Update failed!')
          setSnackOpen(true)
        }
      } else {
        const response: any = await axios.post(Http.create_email_rule_setting, {
          store_id: storeId,
          user_id: userId,
          trigger: trigger,
          recipients: recipients,
          show_send_to_buyer: showSendToBuyer ? 1 : 2,
          subject: subject,
          body: body,
        })

        if (response.result) {
          setSnackSeverity('success')
          setSnackMessage('Save successful!')
          setSnackOpen(true)

          await init(storeId, userId)
          setPage(2)
        } else {
          setSnackSeverity('error')
          setSnackMessage('Save failed!')
          setSnackOpen(true)
        }
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  const onClickTestEmail = async () => {
    try {
      if (!testEmail) {
        return
      }

      if (!IsValidEmail(testEmail)) {
        setSnackSeverity('error')
        setSnackMessage('Incorrect email input')
        setSnackOpen(true)
        return
      }

      const response: any = await axios.get(Http.test_email_setting, {
        params: {
          store_id: storeId,
          user_id: userId,
          email: testEmail,
        },
      })

      if (response.result) {
        setSnackSeverity('success')
        setSnackMessage('Testing successful!')
        setSnackOpen(true)
      } else {
        setSnackSeverity('error')
        setSnackMessage('Testing failed!')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  const onClickSaveEmailServer = async () => {
    try {
      if (!smtpServer || !port || !senderEmailAddress || !login || !password) {
        return
      }

      if (!IsValidEmail(senderEmailAddress)) {
        setSnackSeverity('error')
        setSnackMessage('Incorrect email input')
        setSnackOpen(true)
        return
      }

      if (id && id > 0) {
        const response: any = await axios.put(Http.update_email_setting, {
          id: id,
          smtp_server: smtpServer,
          port: port,
          sender_email: senderEmailAddress,
          login: login,
          password: password,
          show_tls: showTls ? 1 : 2,
        })

        if (response.result) {
          setSnackSeverity('success')
          setSnackMessage('Update successful!')
          setSnackOpen(true)

          await init(storeId, userId)
        } else {
          setSnackSeverity('error')
          setSnackMessage('Update failed!')
          setSnackOpen(true)
        }
      } else {
        const response: any = await axios.post(Http.create_email_setting, {
          store_id: storeId,
          user_id: userId,
          smtp_server: smtpServer,
          port: port,
          sender_email: senderEmailAddress,
          login: login,
          password: password,
          show_tls: showTls ? 1 : 2,
        })

        if (response.result) {
          setSnackSeverity('success')
          setSnackMessage('Save successful!')
          setSnackOpen(true)

          await init(storeId, userId)
        } else {
          setSnackSeverity('error')
          setSnackMessage('Save failed!')
          setSnackOpen(true)
        }
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  const init = async (storeId: number, userId: number) => {
    try {
      const response: any = await axios.get(Http.find_email_setting, {
        params: {
          store_id: storeId,
          user_id: userId,
        },
      })

      if (response.result) {
        setId(response.data.id)
        setLogin(response.data.login || '')
        setPassword(response.data.password || '')
        setPort(response.data.port || 0)
        setSenderEmailAddress(response.data.senderEmail || '')
        setShowTls(response.data.showTls === 1)
        setSmtpServer(response.data.smtpServer || '')
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  useEffect(() => {
    init(storeId, userId)
  }, [storeId, userId])

  return (
    <div className="space-y-8">
      {page === 1 && (
        <div className="space-y-8">
          <div className="space-y-4 max-w-xl">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">Email Server</h3>

            <div className="space-y-2">
              <Label htmlFor="smtp-server">SMTP Server</Label>
              <Input
                id="smtp-server"
                value={smtpServer}
                onChange={(e) => setSmtpServer(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                type="number"
                value={port || ''}
                onChange={(e) => setPort(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sender-email">Sender&apos;s Email Address</Label>
              <Input
                id="sender-email"
                type="email"
                value={senderEmailAddress}
                onChange={(e) => setSenderEmailAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login">Login</Label>
              <Input id="login" value={login} onChange={(e) => setLogin(e.target.value)} />
              <p className="text-xs text-muted-foreground">
                For many email providers (like Gmail) your login is your email address.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <Switch id="tls" checked={showTls} onCheckedChange={setShowTls} />
              <Label htmlFor="tls" className="cursor-pointer">
                TLS certificate security checks
              </Label>
            </div>

            <div className="pt-2">
              <Button
                size="lg"
                onClick={onClickSaveEmailServer}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              >
                Save
              </Button>
            </div>
          </div>

          <div className="space-y-4 max-w-xl pt-4 border-t">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">Testing</h3>

            <div className="space-y-2">
              <Label htmlFor="test-email">To test your settings, enter an email address</Label>
              <Input
                id="test-email"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>

            <div className="pt-2">
              <Button size="lg" onClick={onClickTestEmail}>
                Send Test Email
              </Button>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">Email Rules</h3>
            <p className="text-sm text-muted-foreground">
              <Link href="#" className="text-primary underline hover:opacity-80">
                Email rules
              </Link>{' '}
              allow CryptoPay Server to send customized emails from your store based on events.
            </p>
            <Button size="lg" onClick={() => setPage(2)}>
              Configure
            </Button>
          </div>
        </div>
      )}

      {page === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">Email Rules</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setPage(1)}>
                Back
              </Button>
              <Button
                onClick={() => setPage(3)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              >
                Create Email Rule
              </Button>
            </div>
          </div>

          {!id && (
            <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-sm">
                You need to configure email settings before this feature works.{' '}
                <button
                  onClick={() => setPage(1)}
                  className="font-semibold underline hover:opacity-80"
                >
                  Configure store email settings.
                </button>
              </AlertDescription>
            </Alert>
          )}

          <p className="text-sm text-muted-foreground">
            Email rules allow Cryptopay Server to send customized emails from your store based on
            events.
          </p>

          <div className="pt-2">
            <EmailRuleTable
              setRuleId={setRuleId}
              setTrigger={setTrigger}
              setRecipients={setRecipients}
              setSubject={setSubject}
              setBody={setBody}
              setShowSendToBuyer={setShowSendToBuyer}
              setPage={setPage}
            />
          </div>
        </div>
      )}

      {page === 3 && (
        <div className="space-y-6 max-w-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              Create Email Rule
            </h3>
            <Button
              variant="outline"
              onClick={() => {
                setPage(2)
                clearData()
              }}
            >
              Cancel
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Trigger*</Label>
            <Select
              value={trigger ? String(trigger) : undefined}
              onValueChange={(val: any) => setTrigger(val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select event trigger" />
              </SelectTrigger>
              <SelectContent>
                {EMAIL_RULE_TIGGER_DATAS &&
                  EMAIL_RULE_TIGGER_DATAS.length > 0 &&
                  EMAIL_RULE_TIGGER_DATAS.map((item, index) => (
                    <SelectItem value={String(item.id)} key={index}>
                      {item.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Choose what event sends the email.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipients">Recipients</Label>
            <Input
              id="recipients"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Who to send the email to. For multiple emails, separate with a comma.
            </p>
          </div>

          <div className="flex items-center space-x-3 pt-1">
            <Checkbox
              id="send-buyer"
              checked={showSendToBuyer}
              onCheckedChange={(checked) => setShowSendToBuyer(!!checked)}
            />
            <Label htmlFor="send-buyer" className="cursor-pointer">
              Send the email to the buyer, if email was provided to the invoice
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject*</Label>
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Body*</Label>
            <Textarea id="body" rows={10} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>

          <div className="pt-2">
            <Button
              size="lg"
              onClick={onClickSaveRule}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-8"
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Emails

type RowType = {
  id: number
  rid: number
  trigger: EMAIL_RULE_TIGGER_DATA
  triggerid: number
  to: string
  subject: string
  body: string
  showSendToBuyer: boolean
}

type TableType = {
  setRuleId: (value: number) => void
  setTrigger: (value: EMAIL_RULE_TIGGER_DATA) => void
  setRecipients: (value: string) => void
  setSubject: (value: string) => void
  setBody: (value: string) => void
  setShowSendToBuyer: (value: boolean) => void
  setPage: (value: number) => void
}

function EmailRuleTable(props: TableType) {
  const [rows, setRows] = useState<RowType[]>([])

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
      const response: any = await axios.get(Http.find_email_rule_setting, {
        params: {
          user_id: userId,
          store_id: storeId,
        },
      })

      if (response.result) {
        const rows: RowType[] = (response.data ?? []).map((item: any, index: number) => ({
          id: index + 1,
          rid: item.id,
          trigger: item.trigger,
          triggerid: item.trigger,
          to: item.recipients,
          subject: item.subject,
          body: item.body,
          showSendToBuyer: item.showSendToBuyer === 1,
        }))

        setRows(rows)
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
      const response: any = await axios.put(Http.delete_email_rule_setting_by_id, {
        id: id,
      })

      if (response.result) {
        await init(userId, storeId)

        setSnackSeverity('success')
        setSnackMessage('delete Success.')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Trigger</TableHead>
            <TableHead>Customer Email</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows && rows.length > 0 ? (
            rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">
                  {
                    Object.values(EMAIL_RULE_TIGGER_DATAS).find((item) => item.id === row.triggerid)
                      ?.title
                  }
                </TableCell>
                <TableCell>
                  {row.showSendToBuyer ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <X className="h-4 w-4 text-destructive" />
                  )}
                </TableCell>
                <TableCell>
                  {row.to &&
                    row.to?.split(',').length > 0 &&
                    row.to?.split(',').map((item, index) => (
                      <div key={index} className="text-sm">
                        {item.trim()}
                      </div>
                    ))}
                </TableCell>
                <TableCell>{row.subject}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        props.setRuleId(row.rid)
                        props.setTrigger(row.trigger as EMAIL_RULE_TIGGER_DATA)
                        props.setRecipients(row.to)
                        props.setSubject(row.subject)
                        props.setBody(row.body)
                        props.setShowSendToBuyer(row.showSendToBuyer)
                        props.setPage(3)
                      }}
                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onClickDelete(row.rid)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                No rows
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
