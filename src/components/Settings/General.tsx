// import { CloudUpload, ReportGmailerrorred } from '@mui/icons-material';
// import {
//   Box,
//   Button,
//   FormControl,
//   IconButton,
//   InputAdornment,
//   MenuItem,
//   OutlinedInput,
//   Select,
//   Stack,
//   styled,
//   Switch,
//   TextField,
//   Typography,
// } from '@mui/material';
// import { useSnackPresistStore, useStorePresistStore, useUserPresistStore, useWalletPresistStore } from '@/lib/store';
// import { useEffect, useState } from 'react';
// import axios from '@/utils/http/axios';
// import { Http } from '@/utils/http/http';
// import Image from 'next/image';
// import Link from 'next/link';
// import { CURRENCY, FILE_TYPE } from '@/packages/constants';
// import { SketchPicker } from 'react-color';

// const General = () => {
//   const [storeName, setStoreName] = useState<string>('');
//   const [storeWebsite, setStoreWebsite] = useState<string>('');
//   const [brandColor, setBrandColor] = useState<any>('');
//   const [logoUrl, setLogoUrl] = useState<string>('');
//   const [customCssUrl, setCustomCssUrl] = useState<string>('');
//   const [currency, setCurrency] = useState<string>(CURRENCY[0]);
//   const [allowAnyoneCreateInvoice, setAllowAnyoneCreateInvoice] = useState<boolean>(false);
//   const [addAdditionalFeeToInvoice, setAddAdditionalFeeToInvoice] = useState<number>(1 || 2 || 3);
//   const [invoiceExpiresIfNotPaidFullAmount, setInvoiceExpiresIfNotPaidFullAmount] = useState<number>(0);
//   const [invoicePaidLessThanPrecent, setInvoicePaidLessThanPrecent] = useState<number>(0);

//   const { resetUser } = useUserPresistStore((state) => state);
//   const { resetWallet } = useWalletPresistStore((state) => state);
//   const { getStoreId, resetStore } = useStorePresistStore((state) => state);
//   const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);

//   const VisuallyHiddenInput = styled('input')({
//     clip: 'rect(0 0 0 0)',
//     clipPath: 'inset(50%)',
//     height: 1,
//     overflow: 'hidden',
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     whiteSpace: 'nowrap',
//     width: 1,
//   });

//   const init = async () => {
//     try {
//       const response: any = await axios.get(Http.find_store_by_id, {
//         params: {
//           id: getStoreId(),
//         },
//       });

//       if (response.result) {
//         setStoreName(response.data.name);
//         setStoreWebsite(response.data.website);
//         setCurrency(response.data.currency);
//         setBrandColor(response.data.brand_color);
//         setLogoUrl(response.data.logo_url);
//         setCustomCssUrl(response.data.custom_css_url);
//         setAllowAnyoneCreateInvoice(response.data.allow_anyone_create_invoice === 1 ? true : false);
//         setAddAdditionalFeeToInvoice(response.data.add_additional_fee_to_invoice);
//         setInvoiceExpiresIfNotPaidFullAmount(response.data.invoice_expires_if_not_paid_full_amount);
//         setInvoicePaidLessThanPrecent(response.data.invoice_paid_less_than_precent);
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   useEffect(() => {
//     init();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const onClickSaveStore = async () => {
//     try {
//       if (!CURRENCY.includes(currency)) {
//         setSnackSeverity('error');
//         setSnackMessage('Incorrect currency');
//         setSnackOpen(true);
//         return;
//       }

//       const response: any = await axios.put(Http.update_store_by_id, {
//         id: getStoreId(),
//         brand_color: brandColor ? brandColor : '',
//         logo_url: logoUrl ? logoUrl : '',
//         custom_css_url: customCssUrl ? customCssUrl : '',
//         currency: currency ? currency : '',
//         allow_anyone_create_invoice: allowAnyoneCreateInvoice ? 1 : 2,
//         add_additional_fee_to_invoice: addAdditionalFeeToInvoice,
//         invoice_expires_if_not_paid_full_amount: invoiceExpiresIfNotPaidFullAmount,
//         invoice_paid_less_than_precent: invoicePaidLessThanPrecent,
//       });

//       if (response.result) {
//         setSnackSeverity('success');
//         setSnackMessage('Save successful!');
//         setSnackOpen(true);

//         await init();
//       } else {
//         setSnackSeverity('error');
//         setSnackMessage('The update failed, please try again later.');
//         setSnackOpen(true);
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   const onClickArchiveStore = async () => {
//     try {
//       const response: any = await axios.put(Http.archive_store_by_id, {
//         id: getStoreId(),
//       });

//       if (response.result) {
//         resetUser();
//         resetStore();
//         resetWallet();

//         setTimeout(() => {
//           window.location.href = '/login';
//         }, 1000);
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   const onClickDeleteStore = async () => {
//     try {
//       const response: any = await axios.put(Http.delete_store_by_id, {
//         id: getStoreId(),
//       });

//       if (response.result) {
//         resetUser();
//         resetStore();
//         resetWallet();

//         setTimeout(() => {
//           window.location.href = '/login';
//         }, 1000);
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   const uploadFile = async (data: any) => {
//     try {
//       if (!data || data.length !== 1) {
//         setSnackSeverity('error');
//         setSnackMessage('At least one file is required');
//         setSnackOpen(true);
//         return;
//       }

//       const formData = new FormData();
//       formData.append('file', data[0]);

//       const response: any = await axios.post(Http.upload_file, formData, {
//         params: {
//           file_type: FILE_TYPE.Image,
//         },
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });

//       if (response.result && response.data.urls[0] != '') {
//         setLogoUrl(response.data.urls[0]);

//         setSnackSeverity('success');
//         setSnackMessage('Upload success');
//         setSnackOpen(true);
//       } else {
//         setSnackSeverity('error');
//         setSnackMessage('Upload Failed');
//         setSnackOpen(true);
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   return (
//     <Box>
//       <Box>
//         <Typography variant="h6">General</Typography>
//         <Box mt={4}>
//           <Typography>Store ID</Typography>
//           <Box mt={1}>
//             <TextField fullWidth hiddenLabel value={getStoreId()} size="small" disabled />
//           </Box>
//         </Box>
//         <Box mt={2}>
//           <Typography>Store Name</Typography>
//           <Box mt={1}>
//             <TextField fullWidth hiddenLabel value={storeName} size="small" disabled />
//           </Box>
//         </Box>
//         <Box mt={2}>
//           <Typography>Store Website</Typography>
//           <Box mt={1}>
//             <TextField fullWidth hiddenLabel value={storeWebsite} size="small" disabled />
//           </Box>
//         </Box>
//       </Box>

//       <Box mt={6}>
//         <Typography variant="h6">Branding</Typography>
//         <Box mt={4}>
//           <Typography>Brand Color</Typography>
//           <Box mt={1}>
//             <SketchPicker
//               color={brandColor}
//               onChangeComplete={(e: any) => {
//                 setBrandColor(e.hex);
//               }}
//             />
//           </Box>
//         </Box>
//         <Box mt={6}>
//           <Typography>Logo</Typography>
//           <Box mt={1}>
//             {logoUrl && (
//               <Box mt={4} mb={4}>
//                 <Image src={logoUrl} alt="logo" width={100} height={100} />
//               </Box>
//             )}

//             <Button component="label" role={undefined} variant="contained" tabIndex={-1} startIcon={<CloudUpload />}>
//               Upload file
//               <VisuallyHiddenInput
//                 type="file"
//                 onChange={async (event: any) => {
//                   await uploadFile(event.target.files);
//                 }}
//               />
//             </Button>
//           </Box>
//         </Box>
//         <Box mt={6}>
//           <Typography>Custom CSS</Typography>
//           <Box mt={1}>
//             {customCssUrl && (
//               <Box mt={4} mb={4}>
//                 <Link href={customCssUrl} target="_blank">
//                   {customCssUrl}
//                 </Link>
//               </Box>
//             )}

//             <Button component="label" role={undefined} variant="contained" tabIndex={-1} startIcon={<CloudUpload />}>
//               Upload file
//               <VisuallyHiddenInput type="file" />
//             </Button>
//           </Box>
//           <Typography mt={2}>
//             Use this CSS to customize the public/customer-facing pages of this store. (Invoice, Payment Request, Pull
//             Payment, etc.)
//           </Typography>
//         </Box>
//       </Box>

//       <Box mt={6}>
//         <Typography variant="h6">Payment</Typography>
//         <Box mt={4}>
//           <Typography>Default currency</Typography>
//           <Box mt={1}>
//             <FormControl sx={{ minWidth: 300 }}>
//               <Select
//                 size={'small'}
//                 inputProps={{ 'aria-label': 'Without label' }}
//                 onChange={(e) => {
//                   setCurrency(e.target.value);
//                 }}
//                 value={currency}
//               >
//                 {CURRENCY &&
//                   CURRENCY.length > 0 &&
//                   CURRENCY.map((item, index) => (
//                     <MenuItem value={item} key={index}>
//                       {item}
//                     </MenuItem>
//                   ))}
//               </Select>
//             </FormControl>
//           </Box>
//           <Stack direction={'row'} alignItems={'center'} mt={4}>
//             <Switch
//               checked={allowAnyoneCreateInvoice}
//               onChange={() => {
//                 setAllowAnyoneCreateInvoice(!allowAnyoneCreateInvoice);
//               }}
//             />
//             <Typography ml={2} pr={1}>
//               Allow anyone to create invoice
//             </Typography>
//             <IconButton
//               onClick={() => {
//                 window.location.href = '#';
//               }}
//             >
//               <ReportGmailerrorred />
//             </IconButton>
//           </Stack>

//           <Stack direction={'row'} alignItems={'center'} mt={4}>
//             <Typography pr={1}>Add additional fee (network fee) to invoice …</Typography>
//             <IconButton
//               onClick={() => {
//                 window.location.href = '#';
//               }}
//             >
//               <ReportGmailerrorred />
//             </IconButton>
//           </Stack>

//           <Box mt={1}>
//             <FormControl sx={{ minWidth: 500 }}>
//               <Select
//                 size={'small'}
//                 inputProps={{ 'aria-label': 'Without label' }}
//                 value={addAdditionalFeeToInvoice}
//                 onChange={(e: any) => {
//                   setAddAdditionalFeeToInvoice(e.target.value);
//                 }}
//               >
//                 <MenuItem value={1}>Only if the customer makes more than one payment for the invoice</MenuItem>
//                 <MenuItem value={2}>On every payment</MenuItem>
//                 <MenuItem value={3}>Never add network fee</MenuItem>
//               </Select>
//             </FormControl>
//           </Box>

//           <Box mt={3}>
//             <Stack direction={'row'} alignItems={'center'} mt={4}>
//               <Typography pr={1}>Invoice expires if the full amount has not been paid after …</Typography>
//               <IconButton
//                 onClick={() => {
//                   window.location.href = '#';
//                 }}
//               >
//                 <ReportGmailerrorred />
//               </IconButton>
//             </Stack>

//             <Box mt={1}>
//               <FormControl sx={{ width: '25ch' }} variant="outlined">
//                 <OutlinedInput
//                   size={'small'}
//                   type="number"
//                   endAdornment={<InputAdornment position="end">minutes</InputAdornment>}
//                   aria-describedby="outlined-weight-helper-text"
//                   inputProps={{
//                     'aria-label': 'weight',
//                   }}
//                   value={invoiceExpiresIfNotPaidFullAmount}
//                   onChange={(e: any) => {
//                     setInvoiceExpiresIfNotPaidFullAmount(e.target.value);
//                   }}
//                 />
//               </FormControl>
//             </Box>
//           </Box>

//           <Box mt={3}>
//             <Stack direction={'row'} alignItems={'center'} mt={4}>
//               <Typography pr={1}>
//                 Consider the invoice paid even if the paid amount is ... % less than expected
//               </Typography>
//               <IconButton
//                 onClick={() => {
//                   window.location.href = '#';
//                 }}
//               >
//                 <ReportGmailerrorred />
//               </IconButton>
//             </Stack>

//             <Box mt={1}>
//               <FormControl sx={{ width: '25ch' }} variant="outlined">
//                 <OutlinedInput
//                   size={'small'}
//                   endAdornment={<InputAdornment position="end">percent</InputAdornment>}
//                   aria-describedby="outlined-weight-helper-text"
//                   inputProps={{
//                     'aria-label': 'weight',
//                   }}
//                   value={invoicePaidLessThanPrecent}
//                   onChange={(e: any) => {
//                     setInvoicePaidLessThanPrecent(e.target.value);
//                   }}
//                 />
//               </FormControl>
//             </Box>
//           </Box>

//           <Box mt={4}>
//             <Button variant="contained" size="large" onClick={onClickSaveStore} color={'success'}>
//               Save
//             </Button>
//           </Box>
//         </Box>
//       </Box>

//       <Box mt={6}>
//         <Typography variant="h6">Additional Actions</Typography>
//         <Stack mt={2} direction={'row'} columnGap={3}>
//           <Button variant="contained" onClick={onClickArchiveStore} color={'warning'}>
//             Archive this store
//           </Button>

//           <Button variant="contained" onClick={onClickDeleteStore} color={'error'}>
//             Delete this store
//           </Button>
//         </Stack>
//       </Box>
//     </Box>
//   );
// };

// export default General;

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Upload, AlertCircle } from 'lucide-react'
import { SketchPicker } from 'react-color'

// Shadcn UI 组件
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
  const [allowAnyoneCreateInvoice, setAllowAnyoneCreateInvoice] = useState<boolean>(false)
  const [addAdditionalFeeToInvoice, setAddAdditionalFeeToInvoice] = useState<number>(1)
  const [invoiceExpiresIfNotPaidFullAmount, setInvoiceExpiresIfNotPaidFullAmount] =
    useState<number>(0)
  const [invoicePaidLessThanPrecent, setInvoicePaidLessThanPrecent] = useState<number>(0)

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
        setBrandColor(response.data.brand_color)
        setLogoUrl(response.data.logo_url)
        setCustomCssUrl(response.data.custom_css_url)
        setAllowAnyoneCreateInvoice(response.data.allow_anyone_create_invoice === 1)
        setAddAdditionalFeeToInvoice(response.data.add_additional_fee_to_invoice)
        setInvoiceExpiresIfNotPaidFullAmount(response.data.invoice_expires_if_not_paid_full_amount)
        setInvoicePaidLessThanPrecent(response.data.invoice_paid_less_than_precent)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
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
        setSnackMessage('Incorrect currency')
        setSnackOpen(true)
        return
      }

      const response: any = await axios.put(Http.update_store_by_id, {
        id: storeId,
        brand_color: brandColor ? brandColor : '',
        logo_url: logoUrl ? logoUrl : '',
        custom_css_url: customCssUrl ? customCssUrl : '',
        currency: currency ? currency : '',
        allow_anyone_create_invoice: allowAnyoneCreateInvoice ? 1 : 2,
        add_additional_fee_to_invoice: addAdditionalFeeToInvoice,
        invoice_expires_if_not_paid_full_amount: invoiceExpiresIfNotPaidFullAmount,
        invoice_paid_less_than_precent: invoicePaidLessThanPrecent,
      })

      if (response.result) {
        setSnackSeverity('success')
        setSnackMessage('Save successful!')
        setSnackOpen(true)

        await init(storeId)
      } else {
        setSnackSeverity('error')
        setSnackMessage('The update failed, please try again later.')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  const onClickArchiveStore = async () => {
    try {
      const response: any = await axios.put(Http.archive_store_by_id, {
        id: storeId,
      })

      if (response.result) {
        resetUser()
        resetStore()
        resetWallet()

        setTimeout(() => {
          window.location.href = '/login'
        }, 1000)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  const onClickDeleteStore = async () => {
    try {
      const response: any = await axios.put(Http.delete_store_by_id, {
        id: storeId,
      })

      if (response.result) {
        resetUser()
        resetStore()
        resetWallet()

        setTimeout(() => {
          window.location.href = '/login'
        }, 1000)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  const uploadFile = async (data: any) => {
    try {
      if (!data || data.length !== 1) {
        setSnackSeverity('error')
        setSnackMessage('At least one file is required')
        setSnackOpen(true)
        return
      }

      const formData = new FormData()
      formData.append('file', data[0])

      const response: any = await axios.post(Http.upload_file, formData, {
        params: {
          file_type: FILE_TYPE.Image,
        },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.result && response.data.urls[0] !== '') {
        setLogoUrl(response.data.urls[0])

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
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  return (
    <div className="space-y-10 max-w-2xl">
      {/* General Section */}
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

      {/* Branding Section */}
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
                className="rounded-md object-contain"
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
                className="hidden"
                onChange={async (event: any) => {
                  await uploadFile(event.target.files)
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
              <input id="css-upload" type="file" className="hidden" />
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Use this CSS to customize the public/customer-facing pages of this store. (Invoice,
            Payment Request, Pull Payment, etc.)
          </p>
        </div>
      </div>

      {/* Payment Section */}
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
          <Switch
            id="allow-invoice"
            checked={allowAnyoneCreateInvoice}
            onCheckedChange={setAllowAnyoneCreateInvoice}
          />
          <Label htmlFor="allow-invoice" className="cursor-pointer">
            Allow anyone to create invoice
          </Label>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => {
              window.location.href = '#'
            }}
          >
            <AlertCircle className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex items-center space-x-2">
            <Label>Add additional fee (network fee) to invoice …</Label>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => {
                window.location.href = '#'
              }}
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
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => {
                window.location.href = '#'
              }}
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
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => {
                window.location.href = '#'
              }}
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

      {/* Additional Actions Section */}
      <div className="space-y-4 pt-6 border-t">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">Additional Actions</h3>
        <div className="flex flex-wrap gap-4">
          <Button
            variant="outline"
            onClick={onClickArchiveStore}
            className="border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50"
          >
            Archive this store
          </Button>

          <Button variant="destructive" onClick={onClickDeleteStore}>
            Delete this store
          </Button>
        </div>
      </div>
    </div>
  )
}

export default General
