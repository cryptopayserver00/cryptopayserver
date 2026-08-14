import { useEffect, useState } from 'react'
import CryptoJS from 'crypto-js'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import WebhookDataGrid from '@/components/DataList/WebhookDataGrid'
import { useShallow } from 'zustand/react/shallow'

export const Webhooks = () => {
  const [IsWebhook, setIsWebhook] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const handleClickShowPassword = () => setShowPassword((show) => !show)

  const [modifyId, setModifyId] = useState<number>(0)
  const [payloadUrl, setPayloadUrl] = useState<string>('')
  const [secret, setSecret] = useState<string>('')
  const [showAutomaticRedelivery, setShowAutomaticRedelivery] = useState<boolean>(false)
  const [showEnabled, setShowEnabled] = useState<boolean>(false)
  const [eventType, setEventType] = useState<number>(1)

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

  const onClickButton = async () => {
    try {
      if (modifyId && modifyId > 0) {
        const response: any = await axios.put(Http.update_webhook_setting_by_id, {
          id: modifyId,
          payload_url: payloadUrl ? payloadUrl : '',
          secret: secret ? secret : '',
          automatic_redelivery: showAutomaticRedelivery ? 1 : 2,
          enabled: showEnabled ? 1 : 2,
          event_type: eventType ? eventType : '',
        })

        if (response.result) {
          setSnackSeverity('success')
          setSnackMessage('Update successful!')
          setSnackOpen(true)

          setIsWebhook(false)
        } else {
          setSnackSeverity('error')
          setSnackMessage('Update failed!')
          setSnackOpen(true)
        }
      } else {
        const response: any = await axios.post(Http.create_webhook_setting, {
          store_id: storeId,
          user_id: userId,
          payload_url: payloadUrl ? payloadUrl : '',
          secret: secret ? secret : '',
          automatic_redelivery: showAutomaticRedelivery ? 1 : 2,
          enabled: showEnabled ? 1 : 2,
          event_type: eventType ? eventType : '',
        })

        if (response.result) {
          setSnackSeverity('success')
          setSnackMessage('Save successful!')
          setSnackOpen(true)

          setIsWebhook(false)
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
    } finally {
      clearInput()
    }
  }

  const clearInput = () => {
    setModifyId(0)
    setPayloadUrl('')
    setSecret('')
    setShowAutomaticRedelivery(false)
    setShowEnabled(false)
    setEventType(1)
  }

  useEffect(() => {
    if (payloadUrl && payloadUrl !== '') {
      setSecret(CryptoJS.SHA256(payloadUrl).toString())
    }
  }, [payloadUrl])

  return (
    <div>
      {!IsWebhook ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">Webhooks</h3>
            <Button
              onClick={() => {
                setIsWebhook(true)
              }}
            >
              Create Webhook
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Webhooks allow CryptoPay Server to send HTTP events related to your store to another
            server.
          </p>

          <div className="pt-2">
            <WebhookDataGrid
              source="none"
              setIsWebhook={setIsWebhook}
              setEventType={setEventType}
              setPayloadUrl={setPayloadUrl}
              setSecret={setSecret}
              setShowAutomaticRedelivery={setShowAutomaticRedelivery}
              setShowEnabled={setShowEnabled}
              setModifyId={setModifyId}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6 max-w-3xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              Webhook Settings
            </h3>
            <Button
              variant="outline"
              onClick={() => {
                clearInput()
                setIsWebhook(false)
              }}
            >
              Back
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Payload URL</Label>
              <Input
                value={payloadUrl}
                onChange={(e) => setPayloadUrl(e.target.value)}
                placeholder="https://example.com/webhook"
              />
            </div>

            <div className="space-y-2">
              <Label>Secret</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={secret}
                  disabled
                  className="pr-10 bg-muted/50"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                  onClick={handleClickShowPassword}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground pt-1 leading-relaxed">
                The endpoint receiving the payload must validate the payload by checking that the
                HTTP header <span className="font-semibold text-foreground">CryptoPay-SIG</span> of
                the callback matches the HMAC256 of the secret on the payload&apos;s body bytes.
              </p>
            </div>

            <div className="flex items-start space-x-3 pt-2">
              <Switch
                id="auto-redelivery"
                checked={showAutomaticRedelivery}
                onCheckedChange={setShowAutomaticRedelivery}
              />
              <div className="space-y-1 leading-none">
                <Label htmlFor="auto-redelivery" className="cursor-pointer">
                  Automatic redelivery
                </Label>
                <p className="text-xs text-muted-foreground">
                  We will try to redeliver any failed delivery after 10 seconds, 1 minute and up to
                  6 times after 10 minutes
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <Switch id="enabled" checked={showEnabled} onCheckedChange={setShowEnabled} />
              <Label htmlFor="enabled" className="cursor-pointer">
                Enabled
              </Label>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-1">
              <h4 className="text-lg font-medium text-foreground">Events</h4>
              <p className="text-sm text-muted-foreground">
                Which events would you like to trigger this webhook?
              </p>
            </div>

            <Select value={String(eventType)} onValueChange={(val) => setEventType(Number(val))}>
              <SelectTrigger className="w-full sm:w-[280px]">
                <SelectValue placeholder="Select event trigger" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Send me everything</SelectItem>
                <SelectItem value="2">Send specific events</SelectItem>
              </SelectContent>
            </Select>

            <div className="pt-2">
              <Button
                size="lg"
                onClick={onClickButton}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-8"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Webhooks
