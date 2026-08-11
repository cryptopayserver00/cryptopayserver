// import {
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Checkbox,
//   Paper,
//   Stack,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   TextField,
//   Typography,
// } from '@mui/material';
// import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store';
// import Link from 'next/link';
// import { APIKEYPERMISSIONS, APIKEYPERMISSION } from '@/packages/constants';
// import { useEffect, useState } from 'react';
// import axios from '@/utils/http/axios';
// import { Http } from '@/utils/http/http';

// const ApiKey = () => {
//   const [page, setPage] = useState<number>(1);
//   const [label, setLabel] = useState<string>('');

//   const [permissions, setPermissions] = useState<APIKEYPERMISSION[]>(APIKEYPERMISSIONS);

//   const { getUserId } = useUserPresistStore((state) => state);
//   const { getStoreId } = useStorePresistStore((state) => state);
//   const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);

//   const onClickGenerateAPIKEY = async () => {
//     try {
//       if (!label || !permissions || permissions.length === 0) {
//         return;
//       }

//       let ids: number[] = [];
//       permissions.forEach((item) => {
//         if (item.status) {
//           ids.push(item.id);
//         }
//       });

//       if (ids.length === 0) {
//         setSnackSeverity('error');
//         setSnackMessage('Please turn on at least one permissions!');
//         setSnackOpen(true);
//         return;
//       }

//       const response: any = await axios.post(Http.create_apikey_setting, {
//         user_id: getUserId(),
//         store_id: getStoreId(),
//         label: label,
//         permissions: ids.join(','),
//       });

//       if (response.result) {
//         setSnackSeverity('success');
//         setSnackMessage('Save successful!');
//         setSnackOpen(true);

//         clearData();
//         setPage(1);
//       } else {
//         setSnackSeverity('error');
//         setSnackMessage('Save failed!');
//         setSnackOpen(true);
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   const clearData = () => {
//     setLabel('');
//     setPermissions(() =>
//       APIKEYPERMISSIONS.map((item) => ({
//         ...item,
//         status: false,
//       })),
//     );
//   };

//   return (
//     <Box>
//       {page === 1 && (
//         <>
//           <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
//             <Typography variant={'h6'}>API Keys</Typography>
//             <Button
//               variant={'contained'}
//               size="large"
//               onClick={() => {
//                 setPage(2);
//               }}
//             >
//               Generate Key
//             </Button>
//           </Stack>

//           <Typography mt={4}>
//             The <Link href={'#'}>Greenfield API</Link> offers programmatic access to your instance. You can manage your
//             CryptoPay Server (e.g. stores, invoices, users) as well as automate workflows and integrations (see{' '}
//             <Link href={'#'}>use case examples</Link>). For that you need the API keys, which can be generated here.
//             Find more information in the&nbsp;
//             <Link href={'#'}>API authentication docs</Link>.
//           </Typography>

//           <Box mt={5}>
//             <AccountApiKeyTable />
//           </Box>
//         </>
//       )}

//       {page === 2 && (
//         <>
//           <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
//             <Typography variant={'h6'}>Generate API Key</Typography>
//             <Stack direction={'row'} alignItems={'center'} gap={1}>
//               <Button
//                 variant={'contained'}
//                 size="large"
//                 onClick={() => {
//                   clearData();
//                   setPage(1);
//                 }}
//               >
//                 Back
//               </Button>
//               <Button
//                 variant={'contained'}
//                 size="large"
//                 onClick={() => {
//                   onClickGenerateAPIKEY();
//                 }}
//                 color="success"
//               >
//                 Generate API Key
//               </Button>
//             </Stack>
//           </Stack>

//           <Typography mt={4}>Generate a new api key to use CryptoPay through its API.</Typography>

//           <Box mt={3}>
//             <Typography mb={1} fontSize={14}>
//               Label
//             </Typography>
//             <TextField
//               fullWidth
//               hiddenLabel
//               size="small"
//               value={label}
//               onChange={(e) => {
//                 setLabel(e.target.value);
//               }}
//             />
//           </Box>

//           <Box mt={3}>
//             <Typography>Permissions</Typography>
//             <Box mt={2}>
//               {permissions &&
//                 permissions.map((item, index) => (
//                   <Box mb={2} key={index}>
//                     <Card>
//                       <CardContent>
//                         <Stack direction={'row'} alignItems={'flex-start'}>
//                           <Checkbox
//                             style={{ padding: 0 }}
//                             checked={item.status}
//                             onChange={() => {
//                               const newPermissions = [...permissions];
//                               newPermissions[index].status = !newPermissions[index].status;
//                               setPermissions(newPermissions);
//                             }}
//                           />
//                           <Box ml={1}>
//                             <Stack direction={'row'} alignItems={'center'}>
//                               <Typography fontWeight={'bold'}>{item.title}</Typography>
//                               <Typography ml={1}>{item.tag}</Typography>
//                             </Stack>
//                             <Typography mt={1} fontSize={14}>
//                               {item.description}
//                             </Typography>
//                           </Box>
//                         </Stack>
//                       </CardContent>
//                     </Card>
//                   </Box>
//                 ))}
//             </Box>
//           </Box>
//         </>
//       )}
//     </Box>
//   );
// };

// export default ApiKey;

// type RowType = {
//   id: number;
//   label: string;
//   key: string;
//   permissions: string[];
// };

// function AccountApiKeyTable() {
//   const [rows, setRows] = useState<RowType[]>([]);

//   const { getUserId } = useUserPresistStore((state) => state);
//   const { getStoreId } = useStorePresistStore((state) => state);

//   const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);

//   const init = async () => {
//     try {
//       const response: any = await axios.get(Http.find_apikey_setting, {
//         params: {
//           user_id: getUserId(),
//           store_id: getStoreId(),
//         },
//       });

//       if (response.result) {
//         if (response.data.length > 0) {
//           let rt: RowType[] = [];
//           response.data.forEach((item: any) => {
//             let ps: string[] = [];
//             const ids = item.permissions.split(',');
//             ids &&
//               ids.length > 0 &&
//               ids.forEach((i: any) => {
//                 ps.push(APIKEYPERMISSIONS[parseInt(i) + 1].tag);
//               });

//             rt.push({
//               id: item.id,
//               label: item.label,
//               key: item.api_key,
//               permissions: ps,
//             });
//           });
//           setRows(rt);
//         } else {
//           setRows([]);
//         }
//       } else {
//         setSnackSeverity('error');
//         setSnackMessage('Can not find the data on site!');
//         setSnackOpen(true);
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

//   const onClickDelete = async (id: number) => {
//     try {
//       const response: any = await axios.put(Http.delete_apikey_setting_by_id, {
//         id: id,
//       });

//       if (response.result) {
//         setSnackSeverity('success');
//         setSnackMessage('Delete successful!');
//         setSnackOpen(true);

//         await init();
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   const onClickShowQR = async (id: number) => {};

//   return (
//     <TableContainer component={Paper}>
//       <Table sx={{ minWidth: 650 }} aria-label="simple table">
//         <TableHead>
//           <TableRow>
//             <TableCell>Label</TableCell>
//             <TableCell>Key</TableCell>
//             <TableCell>Permissions</TableCell>
//             <TableCell align="right">Actions</TableCell>
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {rows && rows.length > 0 ? (
//             <>
//               {rows.map((row) => (
//                 <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
//                   <TableCell component="th" scope="row">
//                     {row.label}
//                   </TableCell>
//                   <TableCell>{row.key}</TableCell>
//                   <TableCell>
//                     {row.permissions &&
//                       row.permissions.length > 0 &&
//                       row.permissions.map((item, index) => <Typography key={index}>{item}</Typography>)}
//                   </TableCell>
//                   <TableCell align="right">
//                     <Button
//                       onClick={() => {
//                         onClickDelete(row.id);
//                       }}
//                     >
//                       Delete
//                     </Button>
//                     {/* <Button
//                   onClick={() => {
//                     onClickShowQR(row.id);
//                   }}
//                 >
//                   Show QR
//                 </Button> */}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </>
//           ) : (
//             <TableRow>
//               <TableCell colSpan={100} align="center">
//                 No rows
//               </TableCell>
//             </TableRow>
//           )}
//         </TableBody>
//       </Table>
//     </TableContainer>
//   );
// }

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

const ApiKey = () => {
  const [page, setPage] = useState<number>(1)
  const [label, setLabel] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [permissions, setPermissions] = useState<APIKEYPERMISSION[]>(APIKEYPERMISSIONS)

  const { getUserId } = useUserPresistStore((state) => state)
  const { getStoreId } = useStorePresistStore((state) => state)
  const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state)

  const onClickGenerateAPIKEY = async () => {
    try {
      if (!label || !permissions || permissions.length === 0) {
        return
      }

      const ids: number[] = []
      permissions.forEach((item) => {
        if (item.status) {
          ids.push(item.id)
        }
      })

      if (ids.length === 0) {
        setSnackSeverity('error')
        setSnackMessage('Please turn on at least one permissions!')
        setSnackOpen(true)
        return
      }

      setIsGenerating(true)

      const response: any = await axios.post(Http.create_apikey_setting, {
        user_id: getUserId(),
        store_id: getStoreId(),
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
          {/* Header */}
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

          {/* Description */}
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

          {/* Table */}
          <AccountApiKeyTable />
        </>
      )}

      {page === 2 && (
        <>
          {/* Header */}
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

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Key details</CardTitle>
              <CardDescription>
                Give your key a label and select the permissions it should have
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Label */}
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

              {/* Permissions */}
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

// ─────────────────────────────────────────────
// Table Component
// ─────────────────────────────────────────────

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

  const { getUserId } = useUserPresistStore((state) => state)
  const { getStoreId } = useStorePresistStore((state) => state)
  const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state)

  const init = async () => {
    try {
      const response: any = await axios.get(Http.find_apikey_setting, {
        params: {
          user_id: getUserId(),
          store_id: getStoreId(),
        },
      })

      if (response.result) {
        if (response.data.length > 0) {
          const rt: RowType[] = []
          response.data.forEach((item: any) => {
            const ps: string[] = []
            const ids = item.permissions.split(',')
            ids &&
              ids.length > 0 &&
              ids.forEach((i: any) => {
                ps.push(APIKEYPERMISSIONS[parseInt(i) + 1].tag)
              })

            rt.push({
              id: item.id,
              label: item.label,
              key: item.api_key,
              permissions: ps,
            })
          })
          setRows(rt)
        } else {
          setRows([])
        }
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
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        await init()
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
