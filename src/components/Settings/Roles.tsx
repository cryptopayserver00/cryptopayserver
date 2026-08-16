import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ROLEPERMISSION, ROLEPERMISSIONS, USER_ROLE } from '@/packages/constants'
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { useShallow } from 'zustand/react/shallow'

export const Roles = () => {
  const [page, setPage] = useState<number>(1)

  const [id, setId] = useState<number>(0)
  const [role, setRole] = useState<string>('')
  const [permissions, setPermissions] = useState<ROLEPERMISSION[]>(ROLEPERMISSIONS)

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

  const onClickSave = async () => {
    if (id && id > 0) {
      try {
        if (!permissions || permissions.length === 0) {
          return
        }

        const ids = permissions.filter((item) => item.status).map((item) => item.id)

        if (ids.length === 0) {
          setSnackSeverity('error')
          setSnackMessage('Please turn on at least one permissions!')
          setSnackOpen(true)
          return
        }

        const response: any = await axios.put(Http.update_role_by_id, {
          id: id,
          role: role,
          permissions: ids.join(','),
        })

        if (response.result) {
          setSnackSeverity('success')
          setSnackMessage('Save successful!')
          setSnackOpen(true)

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
        clearData()
      }
    } else {
      try {
        if (!permissions || permissions.length === 0) {
          return
        }

        const ids = permissions.filter((item) => item.status).map((item) => item.id)

        if (ids.length === 0) {
          setSnackSeverity('error')
          setSnackMessage('Please turn on at least one permissions!')
          setSnackOpen(true)
          return
        }

        const response: any = await axios.post(Http.create_role, {
          user_id: userId,
          store_id: storeId,
          role: role,
          permissions: ids.join(','),
        })

        if (response.result) {
          setSnackSeverity('success')
          setSnackMessage('Save successful!')
          setSnackOpen(true)

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
        clearData()
      }
    }
  }

  const clearData = () => {
    setId(0)
    setRole('')
    setPermissions(() =>
      ROLEPERMISSIONS.map((item) => ({
        ...item,
        status: false,
      }))
    )
  }

  const editPermissions = async (id: number, role: string, permissionids: number[]) => {
    setId(id)
    setRole(role)

    if (permissionids.length > 0) {
      const newPermissions = ROLEPERMISSIONS.map((item) => ({
        ...item,
        status: permissionids.includes(Number(item.id)),
      }))
      setPermissions(newPermissions)
    }

    setPage(2)
  }

  return (
    <div className="space-y-6">
      {page === 1 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">Roles</h3>
            <Button
              size="lg"
              onClick={() => {
                setPage(2)
              }}
            >
              Add Roles
            </Button>
          </div>
          <div>
            <StoreRoles editPermissions={editPermissions} />
          </div>
        </div>
      )}

      {page === 2 && (
        <div className="space-y-6 max-w-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">Create role</h3>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  clearData()
                  setPage(1)
                }}
              >
                Return
              </Button>
              <Button
                size="lg"
                onClick={async () => {
                  await onClickSave()
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              >
                Save
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-name">Role</Label>
            <Input
              id="role-name"
              className="max-w-md"
              value={role}
              onChange={(e) => {
                setRole(e.target.value)
              }}
            />
          </div>

          <div className="space-y-3 pt-2">
            <Label className="text-base font-medium">Permissions</Label>
            <div className="space-y-3">
              {permissions &&
                permissions.length > 0 &&
                permissions.map((item, index) => (
                  <Card key={index} className="border shadow-none">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id={`perm-${item.id}`}
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
                              htmlFor={`perm-${item.id}`}
                              className="text-sm font-semibold cursor-pointer text-foreground"
                            >
                              {item.title}
                            </label>
                            <span className="text-xs text-muted-foreground">{item.tag}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Roles

type RowType = {
  id: number
  rid: number
  role: string
  permissionids: number[]
  permissions: string[]
  inUse: boolean
}

type TableType = {
  editPermissions: (id: number, role: string, permissionids: number[]) => void
}

function StoreRoles(props: TableType) {
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
      const response: any = await axios.get(Http.find_role, {
        params: {
          user_id: userId,
          store_id: storeId,
        },
      })

      if (response.result) {
        const rows: RowType[] = (response.data ?? []).map((item: any, index: number) => {
          const roleIds = item.permissions
            ? item.permissions.split(',').filter(Boolean).map(Number)
            : []

          return {
            id: index + 1,
            rid: item.id,
            role: item.role,
            permissionids: roleIds,
            permissions: roleIds.map((id: number) => ROLEPERMISSIONS[id - 1]?.title ?? ''),
            inUse: true,
          }
        })

        setRows(rows)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  const onClickRemove = async (id: number) => {
    try {
      const response: any = await axios.put(Http.delete_role_by_id, {
        id: id,
      })

      if (response.result) {
        await init(userId, storeId)

        setSnackSeverity('success')
        setSnackMessage('remvoe Success.')
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Role</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead>In use</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows && rows.length > 0 ? (
            rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.role}</TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    {row.permissions.map((item: string, index: number) => (
                      <p key={index} className="text-sm">
                        {item}
                      </p>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {row.inUse ? (
                    <Check className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <X className="h-5 w-5 text-destructive" />
                  )}
                </TableCell>
                <TableCell className="text-right w-[200px]">
                  {!Object.values(USER_ROLE).includes(row.role) && (
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          props.editPermissions(row.rid, row.role, row.permissionids)
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          onClickRemove(row.rid)
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                No rows
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
