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
import Link from 'next/link';
import { APIKEYPERMISSIONS, APIKEYPERMISSION } from 'packages/constants';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';

const ApiKey = () => {
  const [page, setPage] = useState<number>(1);
  const [label, setLabel] = useState<string>('');

  const [permissions, setPermissions] = useState<APIKEYPERMISSION[]>(APIKEYPERMISSIONS);

  const { getUserId } = useUserPresistStore((state) => state);
  const { getStoreId } = useStorePresistStore((state) => state);
  const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);

  const onClickGenerateAPIKEY = async () => {
    try {
      if (!label || !permissions || permissions.length === 0) {
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

      const response: any = await axios.post(Http.create_apikey_setting, {
        user_id: getUserId(),
        store_id: getStoreId(),
        label: label,
        permissions: ids.join(','),
      });

      if (response.result) {
        setSnackSeverity('success');
        setSnackMessage('Save successful!');
        setSnackOpen(true);

        clearData();
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
    }
  };

  const clearData = () => {
    setLabel('');
    setPermissions(() =>
      APIKEYPERMISSIONS.map((item) => ({
        ...item,
        status: false,
      })),
    );
  };

  return (
    <Box>
      {page === 1 && (
        <>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
            <Typography variant={'h6'}>API Keys</Typography>
            <Button
              variant={'contained'}
              size="large"
              onClick={() => {
                setPage(2);
              }}
            >
              Generate Key
            </Button>
          </Stack>

          <Typography mt={4}>
            The <Link href={'#'}>Greenfield API</Link> offers programmatic access to your instance. You can manage your
            CryptoPay Server (e.g. stores, invoices, users) as well as automate workflows and integrations (see{' '}
            <Link href={'#'}>use case examples</Link>). For that you need the API keys, which can be generated here.
            Find more information in the&nbsp;
            <Link href={'#'}>API authentication docs</Link>.
          </Typography>

          <Box mt={5}>
            <AccountApiKeyTable />
          </Box>
        </>
      )}

      {page === 2 && (
        <>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
            <Typography variant={'h6'}>Generate API Key</Typography>
            <Stack direction={'row'} alignItems={'center'} gap={1}>
              <Button
                variant={'contained'}
                size="large"
                onClick={() => {
                  clearData();
                  setPage(1);
                }}
              >
                Back
              </Button>
              <Button
                variant={'contained'}
                size="large"
                onClick={() => {
                  onClickGenerateAPIKEY();
                }}
                color="success"
              >
                Generate API Key
              </Button>
            </Stack>
          </Stack>

          <Typography mt={4}>Generate a new api key to use CryptoPay through its API.</Typography>

          <Box mt={3}>
            <Typography mb={1} fontSize={14}>
              Label
            </Typography>
            <TextField
              fullWidth
              hiddenLabel
              size="small"
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
              }}
            />
          </Box>

          <Box mt={3}>
            <Typography>Permissions</Typography>
            <Box mt={2}>
              {permissions &&
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

export default ApiKey;

type RowType = {
  id: number;
  label: string;
  key: string;
  permissions: string[];
};

function AccountApiKeyTable() {
  const [rows, setRows] = useState<RowType[]>([]);

  const { getUserId } = useUserPresistStore((state) => state);
  const { getStoreId } = useStorePresistStore((state) => state);

  const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);

  const init = async () => {
    try {
      const response: any = await axios.get(Http.find_apikey_setting, {
        params: {
          user_id: getUserId(),
          store_id: getStoreId(),
        },
      });

      if (response.result) {
        if (response.data.length > 0) {
          let rt: RowType[] = [];
          response.data.forEach((item: any) => {
            let ps: string[] = [];
            const ids = item.permissions.split(',');
            ids &&
              ids.length > 0 &&
              ids.forEach((i: any) => {
                ps.push(APIKEYPERMISSIONS[parseInt(i) + 1].tag);
              });

            rt.push({
              id: item.id,
              label: item.label,
              key: item.api_key,
              permissions: ps,
            });
          });
          setRows(rt);
        } else {
          setRows([]);
        }
      } else {
        setSnackSeverity('error');
        setSnackMessage('Can not find the data on site!');
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

  const onClickDelete = async (id: number) => {
    try {
      const response: any = await axios.put(Http.delete_apikey_setting_by_id, {
        id: id,
      });

      if (response.result) {
        setSnackSeverity('success');
        setSnackMessage('Delete successful!');
        setSnackOpen(true);

        await init();
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const onClickShowQR = async (id: number) => {};

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Label</TableCell>
            <TableCell>Key</TableCell>
            <TableCell>Permissions</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows && rows.length > 0 ? (
            <>
              {rows.map((row) => (
                <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">
                    {row.label}
                  </TableCell>
                  <TableCell>{row.key}</TableCell>
                  <TableCell>
                    {row.permissions &&
                      row.permissions.length > 0 &&
                      row.permissions.map((item, index) => <Typography key={index}>{item}</Typography>)}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      onClick={() => {
                        onClickDelete(row.id);
                      }}
                    >
                      Delete
                    </Button>
                    {/* <Button
                  onClick={() => {
                    onClickShowQR(row.id);
                  }}
                >
                  Show QR
                </Button> */}
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
