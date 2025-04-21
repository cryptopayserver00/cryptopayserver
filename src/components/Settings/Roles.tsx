import { Check, Clear } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from 'lib/store';
import { ROLEPERMISSION, ROLEPERMISSIONS, USER_ROLE } from 'packages/constants';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';

const Roles = () => {
  const [page, setPage] = useState<number>(1);

  const [id, setId] = useState<number>(0);
  const [role, setRole] = useState<string>('');
  const [permissions, setPermissions] = useState<ROLEPERMISSION[]>(ROLEPERMISSIONS);

  const { getUserId } = useUserPresistStore((state) => state);
  const { getStoreId } = useStorePresistStore((state) => state);
  const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);

  const onClickSave = async () => {
    if (id && id > 0) {
      try {
        if (!permissions || permissions.length === 0) {
          return;
        }

        let ids: number[] = [];
        permissions.forEach((item) => {
          if (item.status) {
            ids.push(item.id);
          }
        });

        if (ids.length === 0) {
          setSnackSeverity('error');
          setSnackMessage('Please turn on at least one permissions!');
          setSnackOpen(true);
          return;
        }

        const response: any = await axios.put(Http.update_role_by_id, {
          id: id,
          role: role,
          permissions: ids.join(','),
        });

        if (response.result) {
          setSnackSeverity('success');
          setSnackMessage('Save successful!');
          setSnackOpen(true);

          setPage(1);
        } else {
          setSnackSeverity('error');
          setSnackMessage('Save failed!');
          setSnackOpen(true);
        }
      } catch (e) {
        setSnackSeverity('error');
        setSnackMessage('The network error occurred. Please try again later.');
        setSnackOpen(true);
        console.error(e);
      } finally {
        clearData();
      }
    } else {
      try {
        if (!permissions || permissions.length === 0) {
          return;
        }

        let ids: number[] = [];
        permissions.forEach((item) => {
          if (item.status) {
            ids.push(item.id);
          }
        });

        if (ids.length === 0) {
          setSnackSeverity('error');
          setSnackMessage('Please turn on at least one permissions!');
          setSnackOpen(true);
          return;
        }

        const response: any = await axios.post(Http.create_role, {
          user_id: getUserId(),
          store_id: getStoreId(),
          role: role,
          permissions: ids.join(','),
        });

        if (response.result) {
          setSnackSeverity('success');
          setSnackMessage('Save successful!');
          setSnackOpen(true);

          setPage(1);
        } else {
          setSnackSeverity('error');
          setSnackMessage('Save failed!');
          setSnackOpen(true);
        }
      } catch (e) {
        setSnackSeverity('error');
        setSnackMessage('The network error occurred. Please try again later.');
        setSnackOpen(true);
        console.error(e);
      } finally {
        clearData();
      }
    }
  };

  const clearData = () => {
    setId(0);
    setRole('');
    setPermissions(() =>
      ROLEPERMISSIONS.map((item) => ({
        ...item,
        status: false,
      })),
    );
  };

  const editPermissions = async (id: number, role: string, permissionids: number[]) => {
    setId(id);
    setRole(role);

    if (permissionids.length > 0) {
      const newPermissions = ROLEPERMISSIONS.map((item) => ({
        ...item,
        status: permissionids.includes(Number(item.id)),
      }));
      setPermissions(newPermissions);
    }

    setPage(2);
  };

  return (
    <Box>
      {page === 1 && (
        <>
          <Stack direction={'row'} justifyContent={'space-between'}>
            <Typography variant="h6">Roles</Typography>

            <Button
              variant={'contained'}
              size="large"
              onClick={() => {
                setPage(2);
              }}
            >
              Add Roles
            </Button>
          </Stack>
          <Box mt={5}>
            <StoreRoles editPermissions={editPermissions} />
          </Box>
        </>
      )}

      {page === 2 && (
        <>
          <Stack direction={'row'} justifyContent={'space-between'}>
            <Typography variant="h6">Create role</Typography>

            <Stack direction={'row'} alignItems={'center'} gap={2}>
              <Button
                variant={'contained'}
                size="large"
                onClick={() => {
                  clearData();
                  setPage(1);
                }}
              >
                Return
              </Button>
              <Button
                variant={'contained'}
                size="large"
                onClick={async () => {
                  await onClickSave();
                }}
                color={'success'}
              >
                Save
              </Button>
            </Stack>
          </Stack>
          <Box mt={3}>
            <Typography mb={1} fontSize={14}>
              Role
            </Typography>
            <TextField
              hiddenLabel
              size="small"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
              }}
            />
          </Box>
          <Box mt={3}>
            <Typography>Permissions</Typography>
            <Box mt={2}>
              {permissions &&
                permissions.length > 0 &&
                permissions.map((item, index) => (
                  <Box mb={2} key={index}>
                    <Card>
                      <CardContent>
                        <Stack direction={'row'} alignItems={'flex-start'}>
                          <Checkbox
                            style={{ padding: 0 }}
                            checked={item.status}
                            onChange={() => {
                              const newPermissions = [...permissions];
                              newPermissions[index].status = !newPermissions[index].status;
                              setPermissions(newPermissions);
                            }}
                          />
                          <Box ml={1}>
                            <Stack direction={'row'} alignItems={'center'}>
                              <Typography fontWeight={'bold'}>{item.title}</Typography>
                              <Typography ml={1}>{item.tag}</Typography>
                            </Stack>
                            <Typography mt={1} fontSize={14}>
                              {item.description}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Roles;

type RowType = {
  id: number;
  rid: number;
  role: string;
  permissionids: number[];
  permissions: string[];
  inUse: boolean;
};

type TableType = {
  editPermissions: (id: number, role: string, permissionids: number[]) => void;
};

function StoreRoles(props: TableType) {
  const [rows, setRows] = useState<RowType[]>([]);

  const { getUserId } = useUserPresistStore((state) => state);
  const { getStoreId } = useStorePresistStore((state) => state);
  const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);

  const init = async () => {
    try {
      const response: any = await axios.get(Http.find_role, {
        params: {
          user_id: getUserId(),
          store_id: getStoreId(),
        },
      });

      if (response.result) {
        if (response.data.length > 0) {
          let rt: RowType[] = [];
          response.data.forEach(async (item: any, index: number) => {
            var permissions: string[] = [];
            var permissionids: number[] = [];
            if (item.permissions) {
              const roleids = item.permissions.split(',');
              if (roleids.length > 0) {
                roleids.map((roleItem: number) => {
                  permissionids.push(Number(roleItem));
                  permissions.push(ROLEPERMISSIONS[roleItem - 1].title);
                });
              }
            }
            rt.push({
              id: index + 1,
              rid: item.id,
              role: item.role,
              permissions: permissions,
              permissionids: permissionids,
              inUse: true,
            });
          });
          setRows(rt);
        } else {
          setRows([]);
        }
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const onClickRemove = async (id: number) => {
    try {
      const response: any = await axios.put(Http.delete_role_by_id, {
        id: id,
      });

      if (response.result) {
        await init();

        setSnackSeverity('success');
        setSnackMessage('remvoe Success.');
        setSnackOpen(true);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Role</TableCell>
            <TableCell>Permissions</TableCell>
            <TableCell>In use</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows && rows.length > 0 ? (
            <>
              {rows.map((row) => (
                <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">
                    {row.role}
                  </TableCell>
                  <TableCell>
                    {row.permissions.map((item: string, index: number) => (
                      <Typography key={index}>{item}</Typography>
                    ))}
                  </TableCell>
                  <TableCell>{row.inUse ? <Check color="success" /> : <Clear color={'error'} />}</TableCell>
                  <TableCell align="right" width={200}>
                    {!Object.values(USER_ROLE).includes(row.role) && (
                      <>
                        <Button
                          onClick={() => {
                            props.editPermissions(row.rid, row.role, row.permissionids);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => {
                            onClickRemove(row.rid);
                          }}
                        >
                          Remove
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </>
          ) : (
            <TableRow>
              <TableCell colSpan={100} align="center">
                No rows
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
