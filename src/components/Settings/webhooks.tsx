import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from 'lib/store';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import CryptoJS from 'crypto-js';

type WebhookType = {
  id: number;
  automaticRedelivery: number;
  enabled: number;
  eventType: number;
  payloadUrl: string;
  secret: string;
  status: number;
};

const Webhooks = () => {
  const [IsWebhook, setIsWebhook] = useState<boolean>(false);
  const [pageStatus, setPageStatus] = useState<'CREATE' | 'UPDATE'>('CREATE');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const [modifyId, setModifyId] = useState<number>(0);
  const [payloadUrl, setPayloadUrl] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [showAutomaticRedelivery, setShowAutomaticRedelivery] = useState<boolean>(false);
  const [showEnabled, setShowEnabled] = useState<boolean>(false);
  const [eventType, setEventType] = useState<number>(1);
  const [webhooks, setWebhooks] = useState<WebhookType[]>([]);

  const { getStoreId } = useStorePresistStore((state) => state);
  const { getUserId } = useUserPresistStore((state) => state);
  const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);

  const init = async () => {
    try {
      const response: any = await axios.get(Http.find_webhook_setting, {
        params: {
          store_id: getStoreId(),
          user_id: getUserId(),
        },
      });

      if (response.result && response.data.length > 0) {
        let ws: WebhookType[] = [];
        response.data.forEach((item: any) => {
          ws.push({
            id: item.id,
            automaticRedelivery: item.automatic_redelivery,
            enabled: item.enabled,
            eventType: item.event_type,
            payloadUrl: item.payload_url,
            secret: item.secret,
            status: item.status,
          });
        });
        setWebhooks(ws);

        return ws;
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const onClickButton = async () => {
    try {
      if (pageStatus === 'CREATE') {
        const response: any = await axios.post(Http.create_webhook_setting, {
          store_id: getStoreId(),
          user_id: getUserId(),
          payload_url: payloadUrl ? payloadUrl : '',
          secret: secret ? secret : '',
          automatic_redelivery: showAutomaticRedelivery ? 1 : 2,
          enabled: showEnabled ? 1 : 2,
          event_type: eventType ? eventType : '',
        });

        if (response.result) {
          setSnackSeverity('success');
          setSnackMessage('Save successful!');
          setSnackOpen(true);

          clearInput();

          await init();

          setIsWebhook(false);
        } else {
          setSnackSeverity('error');
          setSnackMessage('Save failed!');
          setSnackOpen(true);
        }
      } else if (pageStatus === 'UPDATE') {
        const response: any = await axios.put(Http.update_webhook_setting_by_id, {
          id: modifyId,
          store_id: getStoreId(),
          user_id: getUserId(),
          payload_url: payloadUrl ? payloadUrl : '',
          secret: secret ? secret : '',
          automatic_redelivery: showAutomaticRedelivery ? 1 : 2,
          enabled: showEnabled ? 1 : 2,
          event_type: eventType ? eventType : '',
        });

        if (response.result) {
          setSnackSeverity('success');
          setSnackMessage('Update successful!');
          setSnackOpen(true);

          clearInput();

          await init();

          setIsWebhook(false);
        } else {
          setSnackSeverity('error');
          setSnackMessage('Update failed!');
          setSnackOpen(true);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const clearInput = () => {
    setPayloadUrl('');
    setSecret('');
    setShowAutomaticRedelivery(false);
    setShowEnabled(false);
    setEventType(1);
  };

  useEffect(() => {
    if (payloadUrl && payloadUrl != '') {
      setSecret(CryptoJS.SHA256(payloadUrl).toString());
    }
  }, [payloadUrl]);

  return (
    <Box>
      {!IsWebhook ? (
        <Box>
          <Stack direction={'row'} justifyContent={'space-between'}>
            <Typography variant="h6">Webhooks</Typography>
            <Button
              variant={'contained'}
              onClick={() => {
                setIsWebhook(true);
                setPageStatus('CREATE');
              }}
            >
              Create Webhook
            </Button>
          </Stack>

          <Typography mt={2}>
            Webhooks allow CryptoPay Server to send HTTP events related to your store to another server.
          </Typography>
          <Box mt={2}>
            {webhooks && webhooks.length > 0 ? (
              <WebhookDataGrid
                webhooks={webhooks}
                setPageStatus={setPageStatus}
                setIsWebhook={setIsWebhook}
                setEventType={setEventType}
                setPayloadUrl={setPayloadUrl}
                setSecret={setSecret}
                setShowAutomaticRedelivery={setShowAutomaticRedelivery}
                setShowEnabled={setShowEnabled}
                setModifyId={setModifyId}
                init={init}
              />
            ) : (
              <Typography fontSize={14}>There are no webhooks yet.</Typography>
            )}
          </Box>
        </Box>
      ) : (
        <Box>
          <Typography variant="h6">Webhook Settings</Typography>
          <Box mt={2}>
            <Typography>Payload URL</Typography>
            <Box mt={1}>
              <TextField
                fullWidth
                hiddenLabel
                size="small"
                value={payloadUrl}
                onChange={(e: any) => {
                  setPayloadUrl(e.target.value);
                }}
              />
            </Box>
          </Box>
          <Box mt={3}>
            <Typography>Secret</Typography>
            <FormControl fullWidth>
              <OutlinedInput
                size={'small'}
                type={showPassword ? 'text' : 'password'}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                }
                aria-describedby="outlined-weight-helper-text"
                inputProps={{
                  'aria-label': 'weight',
                }}
                value={secret}
                disabled
              />
            </FormControl>
            <Typography mt={1} fontSize={14}>
              The endpoint receiving the payload must validate the payload by checking that the HTTP header
              <span style={{ fontWeight: 'bold' }}> CryptoPay-SIG</span> of the callback matches the HMAC256 of the
              secret on the payload&apos;s body bytes.
            </Typography>
            <Stack mt={2} direction={'row'} alignItems={'center'}>
              <Switch
                checked={showAutomaticRedelivery}
                onChange={() => {
                  setShowAutomaticRedelivery(!showAutomaticRedelivery);
                }}
              />
              <Box ml={2}>
                <Typography>Automatic redelivery</Typography>
                <Typography mt={1} fontSize={14}>
                  We will try to redeliver any failed delivery after 10 seconds, 1 minute and up to 6 times after 10
                  minutes
                </Typography>
              </Box>
            </Stack>
            <Stack mt={3} direction={'row'} alignItems={'center'}>
              <Switch
                checked={showEnabled}
                onChange={() => {
                  setShowEnabled(!showEnabled);
                }}
              />
              <Typography ml={2}>Enabled</Typography>
            </Stack>
          </Box>

          <Box mt={5}>
            <Typography variant="h6">Events</Typography>
            <Typography mt={2}>Which events would you like to trigger this webhook?</Typography>
            <Box mt={1}>
              <Select
                size={'small'}
                inputProps={{ 'aria-label': 'Without label' }}
                value={eventType}
                onChange={(e: any) => {
                  setEventType(e.target.value);
                }}
              >
                <MenuItem value={1}>Send me everything</MenuItem>
                <MenuItem value={2}>Send specific events</MenuItem>
              </Select>
            </Box>
            <Box mt={4}>
              <Button variant={'contained'} size="large" onClick={onClickButton}>
                {pageStatus === 'CREATE' && 'Add webhook'}
                {pageStatus === 'UPDATE' && 'Update webhook'}
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Webhooks;

type GridType = {
  webhooks: WebhookType[];
  setIsWebhook: (value: boolean) => void;
  setPageStatus: (vakue: 'CREATE' | 'UPDATE') => void;
  setPayloadUrl: (value: string) => void;
  setSecret: (value: string) => void;
  setShowAutomaticRedelivery: (value: boolean) => void;
  setShowEnabled: (value: boolean) => void;
  setEventType: (value: number) => void;
  setModifyId: (value: number) => void;
  init: () => Promise<any>;
};

function WebhookDataGrid(props: GridType) {
  const [rows, setRows] = useState<WebhookType[]>(props.webhooks);
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<WebhookType>();

  const { getStoreId } = useStorePresistStore((state) => state);
  const { getUserId } = useUserPresistStore((state) => state);
  const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);

  const onClickRow = async (e: WebhookType) => {
    setSelectedValue(e);
    setOpen(true);
  };

  const onClickTest = async (params: any) => {
    try {
      await axios.get(params.row.payloadUrl);

      setSnackSeverity('success');
      setSnackMessage('Testing successful!');
      setSnackOpen(true);
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('Testing failed!');
      setSnackOpen(true);

      console.error(e);
    }
  };

  const onClickModify = async (params: any) => {
    if (params.row) {
      props.setModifyId(params.row.id);
      props.setEventType(params.row.eventType);
      props.setPayloadUrl(params.row.payloadUrl);
      props.setSecret(params.row.secret);
      props.setShowAutomaticRedelivery(params.row.automaticRedelivery === 1 ? true : false);
      props.setShowEnabled(params.row.enabled === 1 ? true : false);
      props.setPageStatus('UPDATE');
      props.setIsWebhook(true);
    }
  };

  const onClickDelete = async (params: any) => {
    try {
      const response: any = await axios.put(Http.delete_webhook_setting_by_id, {
        id: params.row.id,
        store_id: getStoreId(),
        user_id: getUserId(),
      });

      if (response.result) {
        setSnackSeverity('success');
        setSnackMessage('Delete successful!');
        setSnackOpen(true);

        const ws = await props.init();

        if (ws && ws.length > 0) {
          setRows(ws);
        } else {
          window.location.reload();
        }
      } else {
        setSnackSeverity('error');
        setSnackMessage('Delete failed!');
        setSnackOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const columns: GridColDef<(typeof rows)[number]>[] = [
    {
      field: 'status',
      headerName: 'Status',
      width: 200,
      valueGetter: (value, row) => (value === 1 ? 'TRUE' : 'FALSE'),
    },
    {
      field: 'payloadUrl',
      headerName: 'Url',
      width: 200,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 600,
      align: 'right',
      headerAlign: 'right',
      getActions: (params) => [
        <Stack direction={'row'} alignItems={'center'} key={params.id}>
          <Button
            onClick={() => {
              onClickTest(params);
            }}
          >
            Test
          </Button>
          <Button
            onClick={() => {
              onClickModify(params);
            }}
          >
            Modify
          </Button>
          <Button
            onClick={() => {
              onClickDelete(params);
            }}
          >
            Delete
          </Button>
        </Stack>,
      ],
    },
  ];

  return (
    <Box>
      <DataGrid
        autoHeight
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        pageSizeOptions={[10]}
        onRowClick={(e: any) => {
          onClickRow(e.row);
        }}
        // checkboxSelection
        // disableRowSelectionOnClick
        hideFooter={false}
        disableColumnMenu
      />
    </Box>
  );
}
