import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Paper,
  Select,
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
import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { IsValidEmail } from 'utils/verify';

const Users = () => {
  const [email, setEmail] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  const [role, setRole] = useState<string[]>([]);
  const [refresh, setRefresh] = useState<boolean>(true);

  const { getUserId } = useUserPresistStore((state) => state);
  const { getStoreId } = useStorePresistStore((state) => state);
  const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);

  const onClickAddUser = async () => {
    try {
      setRefresh(false);

      if (!userRole) {
        return;
      }

      if (!email || email === '' || !IsValidEmail(email)) {
        setSnackSeverity('error');
        setSnackMessage('Incorrect email input');
        setSnackOpen(true);
        return;
      }

      const response: any = await axios.post(Http.create_user_roles, {
        user_id: getUserId(),
        store_id: getStoreId(),
        role: userRole,
        email: email,
      });

      if (response.result) {
        setSnackSeverity('success');
        setSnackMessage('Add successful!');
        setSnackOpen(true);
      } else {
        setSnackSeverity('error');
        setSnackMessage('Add failed!');
        setSnackOpen(true);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    } finally {
      setRefresh(true);
      clearData();
    }
  };

  const clearData = () => {
    setEmail('');
  };

  const findRole = async () => {
    try {
      const response: any = await axios.get(Http.find_role, {
        params: {
          user_id: getUserId(),
          store_id: getStoreId(),
        },
      });

      if (response.result) {
        if (response.data.length > 0) {
          let role: string[] = [];
          response.data.forEach(async (item: any) => {
            role.push(item.role);
          });
          setRole(role);
          setUserRole(role[2]);
        } else {
          setRole([]);
        }
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const init = async () => {
    await findRole();
  };

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box>
      <Box>
        <Typography variant="h6">Store Users</Typography>
        <Typography mt={2}>
          Give other registered CryptoPay Server users access to your store. See the{' '}
          <Link href={'/settings'}>roles</Link> for granted permissions.
        </Typography>
        <Stack direction={'row'} alignItems={'center'} gap={3} mt={4}>
          <TextField
            fullWidth
            hiddenLabel
            size="small"
            placeholder="user@example.com"
            value={email}
            onChange={(e: any) => {
              setEmail(e.target.value);
            }}
          />
          <Select
            size={'small'}
            inputProps={{ 'aria-label': 'Without label' }}
            value={userRole}
            onChange={(e) => {
              setUserRole(e.target.value);
            }}
          >
            {role &&
              role.length > 0 &&
              role.map((item, index) => (
                <MenuItem value={item} key={index}>
                  {item}
                </MenuItem>
              ))}
          </Select>

          <Button variant={'contained'} style={{ width: 150 }} onClick={onClickAddUser} color="success">
            Add User
          </Button>
        </Stack>
      </Box>

      {refresh && (
        <Box mt={5}>
          <StoreUserTable defaultRole={role} />
        </Box>
      )}
    </Box>
  );
};

export default Users;

type RowType = {
  id: number;
  rid: number;
  email: string;
  role: string;
};

type TableType = {
  defaultRole: string[];
};

function StoreUserTable(props: TableType) {
  const [rows, setRows] = useState<RowType[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const [id, setId] = useState<number>(0);
  const [email, setEmail] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');

  const { getUserId } = useUserPresistStore((state) => state);
  const { getStoreId } = useStorePresistStore((state) => state);
  const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);

  const findUserRole = async () => {
    try {
      const response: any = await axios.get(Http.find_user_roles, {
        params: {
          user_id: getUserId(),
          store_id: getStoreId(),
        },
      });

      if (response.result) {
        if (response.data.length > 0) {
          let rt: RowType[] = [];
          response.data.forEach(async (item: any, index: number) => {
            rt.push({
              id: index + 1,
              rid: item.id,
              email: item.email,
              role: item.role,
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

  const init = async () => {
    await findUserRole();
  };

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onClickChangeRole = async () => {
    if (!id || !email || !userRole) {
      return;
    }

    try {
      const response: any = await axios.put(Http.update_userrole_by_id, {
        id: id,
        role: userRole,
        email: email,
      });

      if (response.result) {
        await init();

        setSnackSeverity('success');
        setSnackMessage('Change successful!');
        setSnackOpen(true);
      } else {
        setSnackSeverity('error');
        setSnackMessage('Change failed!');
        setSnackOpen(true);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    } finally {
      handleDialogClose();
    }
  };

  const onClickRemove = async (id: number) => {
    try {
      const response: any = await axios.put(Http.delete_user_role_by_id, {
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

  const handleDialogClose = () => {
    clearData();

    setOpenDialog(false);
  };

  const clearData = () => {
    setId(0);
    setEmail('');
    setUserRole('');
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows && rows.length > 0 ? (
              <>
                {rows.map((row) => (
                  <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row">
                      {row.email}
                    </TableCell>
                    <TableCell>{row.role}</TableCell>
                    <TableCell align="right">
                      <Button
                        onClick={() => {
                          setId(row.rid);
                          setEmail(row.email);
                          setUserRole(row.role);
                          setOpenDialog(true);
                        }}
                      >
                        Change Role
                      </Button>
                      <Button
                        onClick={() => {
                          onClickRemove(row.rid);
                        }}
                      >
                        Remove
                      </Button>
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

      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth
      >
        <DialogTitle id="alert-dialog-title">Edit {email}</DialogTitle>
        <DialogContent>
          <Typography mt={2} mb={1}>
            New role
          </Typography>
          <Box mb={2}>
            <FormControl variant="outlined" fullWidth size={'small'}>
              <Select
                size={'small'}
                inputProps={{ 'aria-label': 'Without label' }}
                value={userRole}
                onChange={(e) => {
                  setUserRole(e.target.value);
                }}
              >
                {props.defaultRole &&
                  props.defaultRole.length > 0 &&
                  props.defaultRole.map((item, index) => (
                    <MenuItem value={item} key={index}>
                      {item}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant={'outlined'} onClick={handleDialogClose}>
            Cancel
          </Button>
          <Button
            variant={'contained'}
            onClick={async () => {
              await onClickChangeRole();
            }}
          >
            Change Role
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
