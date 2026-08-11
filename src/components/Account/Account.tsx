// import styled from '@emotion/styled';
// import { CloudUpload } from '@mui/icons-material';
// import { Box, Button, FormControl, OutlinedInput, Stack, Typography } from '@mui/material';
// import { useSnackPresistStore } from '@/lib/store';
// import { useUserPresistStore } from '@/lib/store/user';
// import Image from 'next/image';
// import { FILE_TYPE } from '@/packages/constants';
// import { useEffect, useState } from 'react';
// import axios from '@/utils/http/axios';
// import { Http } from '@/utils/http/http';

// const MainAccount = () => {
//   const { getUserEmail } = useUserPresistStore((state) => state);

//   const [email, setEmail] = useState<string>('');
//   const [name, setName] = useState<string>('');
//   const [profileUrl, setProfileUrl] = useState<string>('');

//   const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);

//   const onClickSave = async () => {
//     try {
//       const response: any = await axios.put(Http.update_user_by_email, {
//         email: email,
//         username: name,
//         profile_picture_url: profileUrl,
//       });

//       if (response.result) {
//         setSnackSeverity('success');
//         setSnackMessage('Update successful!');
//         setSnackOpen(true);
//       } else {
//         setSnackSeverity('error');
//         setSnackMessage('Update failed!');
//         setSnackOpen(true);
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   const onClickDeleteAccount = async () => {
//     try {
//       const response: any = await axios.put(Http.delete_user_by_email, {
//         email: email,
//       });

//       if (response.result) {
//         setSnackSeverity('success');
//         setSnackMessage('Delete successful!');
//         setSnackOpen(true);
//       } else {
//         setSnackSeverity('error');
//         setSnackMessage('Delete failed!');
//         setSnackOpen(true);
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   const init = async () => {
//     try {
//       if (!getUserEmail()) return;

//       const response: any = await axios.get(Http.find_user_by_email, {
//         params: {
//           email: getUserEmail(),
//         },
//       });

//       if (response.result) {
//         setName(response.data.username);
//         setEmail(response.data.email);
//         setProfileUrl(response.data.profile_picture_url);
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
//         setProfileUrl(response.data.urls[0]);

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
//       <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
//         <Typography variant={'h6'}>Update your account</Typography>
//         <Button variant={'contained'} onClick={onClickSave} size="large" color={'success'}>
//           Save
//         </Button>
//       </Stack>

//       <Box mt={4}>
//         <Typography>Email</Typography>
//         <Box mt={1}>
//           <FormControl fullWidth variant="outlined">
//             <OutlinedInput
//               size={'small'}
//               aria-describedby="outlined-weight-helper-text"
//               inputProps={{
//                 'aria-label': 'weight',
//               }}
//               value={email}
//               onChange={(e: any) => {
//                 setEmail(e.target.value);
//               }}
//             />
//           </FormControl>
//         </Box>
//       </Box>

//       <Box mt={2}>
//         <Typography>Name</Typography>
//         <Box mt={1}>
//           <FormControl fullWidth variant="outlined">
//             <OutlinedInput
//               fullWidth
//               size={'small'}
//               aria-describedby="outlined-weight-helper-text"
//               inputProps={{
//                 'aria-label': 'weight',
//               }}
//               value={name}
//               onChange={(e: any) => {
//                 setName(e.target.value);
//               }}
//             />
//           </FormControl>
//         </Box>
//       </Box>

//       <Box mt={4}>
//         <Typography>Profile Picture</Typography>
//         <Box mt={1}>
//           {profileUrl && (
//             <Box mt={4} mb={4}>
//               <Image src={profileUrl} alt="logo" width={100} height={100} />
//             </Box>
//           )}

//           <Button component="label" role={undefined} variant="contained" tabIndex={-1} startIcon={<CloudUpload />}>
//             Choose File
//             <VisuallyHiddenInput
//               type="file"
//               onChange={async (event: any) => {
//                 await uploadFile(event.target.files);
//               }}
//             />
//           </Button>
//         </Box>
//       </Box>

//       <Box mt={5}>
//         <Typography variant={'h6'}>Delete Account</Typography>
//         <Box mt={2}>
//           <Button variant={'contained'} size={'large'} onClick={onClickDeleteAccount} color={'error'}>
//             Delete Account
//           </Button>
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// export default MainAccount;

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, Trash2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSnackPresistStore } from '@/lib/store'
import { useUserPresistStore } from '@/lib/store/user'
import { FILE_TYPE } from '@/packages/constants'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'

const MainAccount = () => {
  const { getUserEmail } = useUserPresistStore((state) => state)

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [profileUrl, setProfileUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state)

  const onClickSave = async () => {
    try {
      setIsSaving(true)
      const response: any = await axios.put(Http.update_user_by_email, {
        email,
        username: name,
        profile_picture_url: profileUrl,
      })

      if (response.result) {
        setSnackSeverity('success')
        setSnackMessage('Update successful!')
        setSnackOpen(true)
      } else {
        setSnackSeverity('error')
        setSnackMessage('Update failed!')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    } finally {
      setIsSaving(false)
    }
  }

  const onClickDeleteAccount = async () => {
    try {
      setIsDeleting(true)
      const response: any = await axios.put(Http.delete_user_by_email, {
        email,
      })

      if (response.result) {
        setSnackSeverity('success')
        setSnackMessage('Delete successful!')
        setSnackOpen(true)
      } else {
        setSnackSeverity('error')
        setSnackMessage('Delete failed!')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    } finally {
      setIsDeleting(false)
    }
  }

  const init = async () => {
    try {
      if (!getUserEmail()) return

      const response: any = await axios.get(Http.find_user_by_email, {
        params: {
          email: getUserEmail(),
        },
      })

      if (response.result) {
        setName(response.data.username)
        setEmail(response.data.email)
        setProfileUrl(response.data.profile_picture_url)
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

  const uploadFile = async (files: FileList | null) => {
    try {
      if (!files || files.length !== 1) {
        setSnackSeverity('error')
        setSnackMessage('At least one file is required')
        setSnackOpen(true)
        return
      }

      setIsUploading(true)
      const formData = new FormData()
      formData.append('file', files[0])

      const response: any = await axios.post(Http.upload_file, formData, {
        params: {
          file_type: FILE_TYPE.Image,
        },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.result && response.data.urls[0] !== '') {
        setProfileUrl(response.data.urls[0])
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
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Account Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your profile information and account preferences
          </p>
        </div>
        <Button onClick={onClickSave} disabled={isSaving} className="gap-2">
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save changes'}
        </Button>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information and profile picture</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 border">
              <AvatarImage src={profileUrl || undefined} alt={name || 'Profile'} />
              <AvatarFallback className="text-lg">
                {name ? name.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {isUploading ? 'Uploading...' : 'Upload photo'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => uploadFile(e.target.files)}
                />
              </div>
              <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 5MB.</p>
            </div>
          </div>

          <Separator />

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Display name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <div className="space-y-1">
              <p className="font-medium">Delete account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data. This action cannot be
                undone.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={onClickDeleteAccount}
              disabled={isDeleting}
              className="gap-2 shrink-0"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? 'Deleting...' : 'Delete account'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MainAccount
