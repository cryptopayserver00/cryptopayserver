'use client'

import { useEffect, useState, useRef } from 'react'
import { Upload, Trash2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { useSnackPresistStore, useStorePresistStore, useWalletPresistStore } from '@/lib/store'
import { useUserPresistStore } from '@/lib/store/user'
import { FILE_TYPE } from '@/packages/constants'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { useShallow } from 'zustand/react/shallow'

const MainAccount = () => {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [profileUrl, setProfileUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const { userId, resetUser } = useUserPresistStore(
    useShallow((state) => ({
      userId: state.userId,
      resetUser: state.resetUser,
    }))
  )

  const { resetStore } = useStorePresistStore(
    useShallow((state) => ({
      resetStore: state.resetStore,
    }))
  )

  const { resetWallet } = useWalletPresistStore(
    useShallow((state) => ({
      resetWallet: state.resetWallet,
    }))
  )

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      setSnackSeverity: state.setSnackSeverity,
      setSnackMessage: state.setSnackMessage,
      setSnackOpen: state.setSnackOpen,
    }))
  )

  const showSnack = (severity: 'success' | 'error', message: string) => {
    setSnackSeverity(severity)
    setSnackMessage(message)
    setSnackOpen(true)
  }

  const onClickSave = async () => {
    try {
      setIsSaving(true)
      const response: any = await axios.put(Http.update_user_by_userid, {
        user_id: userId,
        email,
        username: name,
        profile_picture_url: profileUrl,
      })

      if (response.result) {
        showSnack('success', 'Update successful!')
      } else {
        showSnack('error', 'Update failed!')
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    } finally {
      setIsSaving(false)
    }
  }

  const onClickDeleteAccount = async () => {
    try {
      setIsDeleting(true)
      const response: any = await axios.put(Http.delete_user_by_userid, {
        user_id: userId,
      })

      if (response.result) {
        resetUser()
        resetStore()
        resetWallet()
        showSnack('success', 'Delete successful!')
        setOpenDeleteDialog(false)
        setTimeout(() => {
          window.location.href = '/login'
        }, 1000)
      } else {
        showSnack('error', 'Delete failed!')
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    } finally {
      setIsDeleting(false)
    }
  }

  const init = async (userId: number) => {
    try {
      const response: any = await axios.get(Http.find_user_by_userid, {
        params: {
          user_id: userId,
        },
      })

      if (response.result) {
        setName(response.data.username)
        setEmail(response.data.email)
        setProfileUrl(response.data.profilePictureUrl)
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    }
  }

  useEffect(() => {
    init(userId)
  }, [userId])

  const uploadFile = async (files: FileList | null) => {
    try {
      if (!files || files.length !== 1) {
        showSnack('error', 'At least one file is required')
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
        showSnack('success', 'Upload success')
      } else {
        showSnack('error', 'Upload Failed')
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleOpenChange = (open: boolean) => {
    setOpenDeleteDialog(open)
    if (!open) {
      setConfirmText('')
    }
  }

  const isConfirmMatched = confirmText === email

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Account Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your profile information and account preferences
          </p>
        </div>
        <Button onClick={onClickSave} disabled={isSaving} className="gap-2">
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save changes'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information and profile picture</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
              onClick={() => setOpenDeleteDialog(true)}
              disabled={isDeleting}
              className="shrink-0 gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete account
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={openDeleteDialog} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your account, wallets, and all associated data. This
              action <span className="font-semibold text-destructive">cannot be undone</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="confirm-email" className="text-sm">
              Type <span className="font-mono font-semibold">{email}</span> to confirm
            </Label>
            <Input
              id="confirm-email"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoComplete="off"
              autoFocus
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={!isConfirmMatched || isDeleting}
              onClick={(e) => {
                e.preventDefault()
                onClickDeleteAccount()
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default MainAccount
