import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Upload, AlertCircle } from 'lucide-react'
import { SketchPicker } from 'react-color'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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

import {
  useSnackPresistStore,
  useStorePresistStore,
  useUserPresistStore,
  useWalletPresistStore,
} from '@/lib/store'
import axios from '@/utils/http/axios'
import { getApiErrorMessage } from '@/utils/http/api-error'
import { Http } from '@/utils/http/http'
import { CURRENCY, FILE_TYPE } from '@/packages/constants'
import { useShallow } from 'zustand/react/shallow'

const General = () => {
  const [storeName, setStoreName] = useState<string>('')
  const [storeWebsite, setStoreWebsite] = useState<string>('')
  const [brandColor, setBrandColor] = useState<any>('')
  const [logoUrl, setLogoUrl] = useState<string>('')
  const [customCssUrl, setCustomCssUrl] = useState<string>('')
  const [currency, setCurrency] = useState<string>(CURRENCY[0])
  const [addAdditionalFeeToInvoice, setAddAdditionalFeeToInvoice] = useState<number>(1)
  const [invoiceExpiresIfNotPaidFullAmount, setInvoiceExpiresIfNotPaidFullAmount] =
    useState<number>(0)
  const [invoicePaidLessThanPrecent, setInvoicePaidLessThanPrecent] = useState<number>(0)
  const [storeAction, setStoreAction] = useState<'archive' | 'delete' | null>(null)
  const [storeActionBusy, setStoreActionBusy] = useState(false)

  const { resetUser } = useUserPresistStore(
    useShallow((state) => ({
      resetUser: state.resetUser,
    }))
  )

  const { resetWallet } = useWalletPresistStore(
    useShallow((state) => ({
      resetWallet: state.resetWallet,
    }))
  )

  const { storeId, resetStore } = useStorePresistStore(
    useShallow((state) => ({
      storeId: state.storeId,
      resetStore: state.resetStore,
    }))
  )

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      setSnackSeverity: state.setSnackSeverity,
      setSnackMessage: state.setSnackMessage,
      setSnackOpen: state.setSnackOpen,
    }))
  )

  const init = async (storeId: number) => {
    try {
      const response: any = await axios.get(Http.find_store_by_id, {
        params: {
          id: storeId,
        },
      })

      if (response.result) {
        setStoreName(response.data.name)
        setStoreWebsite(response.data.website)
        setCurrency(response.data.currency)
        setBrandColor(response.data.brandColor)
        setLogoUrl(response.data.logoUrl)
        setCustomCssUrl(response.data.customCssUrl)
        setAddAdditionalFeeToInvoice(response.data.add_additionalFeeToInvoice)
        setInvoiceExpiresIfNotPaidFullAmount(response.data.invoice_expiresIfNotPaidFullAmount)
        setInvoicePaidLessThanPrecent(response.data.invoicePaidLessThanPrecent)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage(getApiErrorMessage(e))
      setSnackOpen(true)
      console.error(e)
    }
  }

  useEffect(() => {
    init(storeId)
  }, [storeId])

  const onClickSaveStore = async () => {
    try {
      if (!CURRENCY.includes(currency)) {
        setSnackSeverity('error')
        setSnackMessage('Please select a valid currency')
        setSnackOpen(true)
        return
      }

      const response: any = await axios.put(Http.update_store_by_id, {
        id: storeId,
        brand_color: brandColor ? brandColor : '',
        logo_url: logoUrl ? logoUrl : '',
        custom_css_url: customCssUrl ? customCssUrl : '',
        currency: currency ? currency : '',
        allow_anyone_create_invoice: 2,
        add_additional_fee_to_invoice: addAdditionalFeeToInvoice,
        invoice_expires_if_not_paid_full_amount: invoiceExpiresIfNotPaidFullAmount,
        invoice_paid_less_than_precent: invoicePaidLessThanPrecent,
      })

      if (response.result) {
        setSnackSeverity('success')
        setSnackMessage('Saved successfully!')
        setSnackOpen(true)

        await init(storeId)
      } else {
        setSnackSeverity('error')
        setSnackMessage('Update failed. Please try again later.')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage(getApiErrorMessage(e))
      setSnackOpen(true)
      console.error(e)
    }
  }

  const onConfirmStoreAction = async () => {
    if (!storeAction) return
    try {
      setStoreActionBusy(true)
      const response: any = await axios.put(
        storeAction === 'archive' ? Http.archive_store_by_id : Http.delete_store_by_id,
        {
          id: storeId,
        }
      )

      if (response.result) {
        resetUser()
        resetStore()
        resetWallet()
        setStoreAction(null)

        setTimeout(() => {
          window.location.href = '/login'
        }, 1000)
      } else {
        setSnackSeverity('error')
        setSnackMessage(response.message || 'Store action failed')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage(getApiErrorMessage(e))
      setSnackOpen(true)
      console.error(e)
    } finally {
      setStoreActionBusy(false)
    }
  }

  const uploadFile = async (data: FileList | null, kind: 'logo' | 'css') => {
    try {
      if (!data || data.length !== 1) {
        setSnackSeverity('error')
        setSnackMessage('At least one file is required')
        setSnackOpen(true)
        return
      }

      const file = data[0]
      if (kind === 'css' && !file.name.toLowerCase().endsWith('.css')) {
        setSnackSeverity('error')
        setSnackMessage('Custom CSS must be a .css file')
        setSnackOpen(true)
        return
      }
      if (kind === 'logo' && file.name.toLowerCase().endsWith('.css')) {
        setSnackSeverity('error')
        setSnackMessage('Logo must be an image file')
        setSnackOpen(true)
        return
      }

      const formData = new FormData()
      formData.append('file', file)

      const response: any = await axios.post(Http.upload_file, formData, {
        params: {
          file_type: FILE_TYPE.Image,
        },
      })

      if (response.result && response.data.urls[0] !== '') {
        if (kind === 'css') {
          setCustomCssUrl(response.data.urls[0])
        } else {
          setLogoUrl(response.data.urls[0])
        }

        setSnackSeverity('success')
        setSnackMessage('Upload success')
        setSnackOpen(true)
      } else {
        setSnackSeverity('error')
        setSnackMessage('Upload Failed')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage(getApiErrorMessage(e))
      setSnackOpen(true)
      console.error(e)
    }
  }

  return (
    <div className="space-y-10 max-w-2xl">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">General</h3>

        <div className="space-y-2">
          <Label htmlFor="store-id">Store ID</Label>
          <Input id="store-id" value={storeId} disabled />
        </div>

        <div className="space-y-2">
          <Label htmlFor="store-name">Store Name</Label>
          <Input id="store-name" value={storeName} disabled />
        </div>

        <div className="space-y-2">
          <Label htmlFor="store-website">Store Website</Label>
          <Input id="store-website" value={storeWebsite} disabled />
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">Branding</h3>

        <div className="space-y-2">
          <Label>Brand Color</Label>
          <div className="pt-1">
            <SketchPicker color={brandColor} onChangeComplete={(e: any) => setBrandColor(e.hex)} />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Logo</Label>
          {logoUrl && (
            <div className="my-2">
              <Image
                src={logoUrl}
                alt="logo"
                width={100}
                height={100}
                className="rounded-md object-contain h-25 w-25"
              />
            </div>
          )}
          <div>
            <Label htmlFor="logo-upload" className="cursor-pointer">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors">
                <Upload className="h-4 w-4" />
                Upload file
              </span>
              <input
                id="logo-upload"
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp,.png,.jpg,.jpeg,.gif,.webp"
                className="hidden"
                onChange={async (event) => {
                  await uploadFile(event.target.files, 'logo')
                  event.target.value = ''
                }}
              />
            </Label>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Custom CSS</Label>
          {customCssUrl && (
            <div className="my-2">
              <Link
                href={customCssUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary underline hover:opacity-80"
              >
                {customCssUrl}
              </Link>
            </div>
          )}
          <div>
            <Label htmlFor="css-upload" className="cursor-pointer">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors">
                <Upload className="h-4 w-4" />
                Upload file
              </span>
              <input
                id="css-upload"
                type="file"
                accept=".css,text/css"
                className="hidden"
                onChange={async (event) => {
                  await uploadFile(event.target.files, 'css')
                  event.target.value = ''
                }}
              />
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Use this CSS to customize the public/customer-facing pages of this store. (Invoice,
            Payment Request, Pull Payment, etc.) Upload a .css file, then Save.
          </p>
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">Payment</h3>

        <div className="space-y-2">
          <Label>Default currency</Label>
          <Select value={currency} onValueChange={(val) => setCurrency(val)}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCY &&
                CURRENCY.length > 0 &&
                CURRENCY.map((item, index) => (
                  <SelectItem value={item} key={index}>
                    {item}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-3 pt-2">
          <Switch id="allow-invoice" checked={false} disabled />
          <Label htmlFor="allow-invoice" className="cursor-not-allowed text-muted-foreground">
            Allow anyone to create invoice (not available)
          </Label>
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex items-center space-x-2">
            <Label>Add additional fee (network fee) to invoice …</Label>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Controls when network fees are added on top of the invoice amount."
              aria-label="About additional network fee"
            >
              <AlertCircle className="h-4 w-4" />
            </Button>
          </div>
          <Select
            value={String(addAdditionalFeeToInvoice)}
            onValueChange={(val) => setAddAdditionalFeeToInvoice(Number(val))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select fee policy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">
                Only if the customer makes more than one payment for the invoice
              </SelectItem>
              <SelectItem value="2">On every payment</SelectItem>
              <SelectItem value="3">Never add network fee</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex items-center space-x-2">
            <Label htmlFor="expire-minutes">
              Invoice expires if the full amount has not been paid after …
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Invoice is marked expired if the full amount is not paid within this many minutes."
              aria-label="About invoice expiry"
            >
              <AlertCircle className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative w-64">
            <Input
              id="expire-minutes"
              type="number"
              value={invoiceExpiresIfNotPaidFullAmount}
              onChange={(e) => setInvoiceExpiresIfNotPaidFullAmount(Number(e.target.value))}
              className="pr-16"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              minutes
            </span>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex items-center space-x-2">
            <Label htmlFor="paid-percent">
              Consider the invoice paid even if the paid amount is ... % less than expected
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Tolerance for underpayment before the invoice is still considered paid."
              aria-label="About underpayment tolerance"
            >
              <AlertCircle className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative w-64">
            <Input
              id="paid-percent"
              type="number"
              value={invoicePaidLessThanPrecent}
              onChange={(e) => setInvoicePaidLessThanPrecent(Number(e.target.value))}
              className="pr-16"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              percent
            </span>
          </div>
        </div>

        <div className="pt-4">
          <Button
            size="lg"
            onClick={onClickSaveStore}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-8"
          >
            Save
          </Button>
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">Additional Actions</h3>
        <div className="flex flex-wrap gap-4">
          <Button
            variant="outline"
            onClick={() => setStoreAction('archive')}
            className="border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50"
          >
            Archive this store
          </Button>

          <Button variant="destructive" onClick={() => setStoreAction('delete')}>
            Delete this store
          </Button>
        </div>
      </div>

      <AlertDialog
        open={storeAction !== null}
        onOpenChange={(open) => {
          if (!open && !storeActionBusy) setStoreAction(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {storeAction === 'archive' ? 'Archive this store?' : 'Delete this store?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {storeAction === 'archive'
                ? 'Archiving hides the store from day-to-day use. You will be signed out of the current store context.'
                : 'Deleting permanently removes this store and its settings. This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={storeActionBusy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={storeActionBusy}
              onClick={(e) => {
                e.preventDefault()
                onConfirmStoreAction()
              }}
              className={
                storeAction === 'delete'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : undefined
              }
            >
              {storeActionBusy
                ? 'Working...'
                : storeAction === 'archive'
                  ? 'Archive store'
                  : 'Delete store'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default General
