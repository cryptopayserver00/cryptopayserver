import { Check, Clear, KeyboardArrowDown, Visibility, VisibilityOff } from '@mui/icons-material';
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
  Checkbox,
  Switch,
  TextField,
  Typography,
  Alert,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from 'lib/store';
import Link from 'next/link';
import { EMAIL_RULE_TIGGER_DATA, EMAIL_RULE_TIGGER_DATAS } from 'packages/constants';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { IsValidEmail } from 'utils/verify';

const Emails = () => {
  const [page, setPage] = useState<number>(1);
  const [id, setId] = useState<number>(0);
  const [smtpServer, setSmtpServer] = useState<string>('');
  const [port, setPort] = useState<number>(0);
  const [senderEmailAddress, setSenderEmailAddress] = useState<string>('');
  const [login, setLogin] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showTls, setShowTls] = useState<boolean>(false);
  const [testEmail, setTestEmail] = useState<string>('');

  const [ruleId, setRuleId] = useState<number>(0);
  const [trigger, setTrigger] = useState<EMAIL_RULE_TIGGER_DATA>();
  const [recipients, setRecipients] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [showSendToBuyer, setShowSendToBuyer] = useState<boolean>(false);

  const { getStoreId } = useStorePresistStore((state) => state);
  const { getUserId } = useUserPresistStore((state) => state);
  const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const clearData = () => {
    setRuleId(0);
    setTrigger(undefined);
    setRecipients('');
    setShowSendToBuyer(false);
    setSubject('');
    setBody('');
  };

  const onClickSaveRule = async () => {
    try {
      if (!trigger || !recipients || !subject || !body) {
        return;
      }

      const emails = recipients.split(',');
      for (const item of emails) {
        if (!IsValidEmail(item)) {
          setSnackSeverity('error');
          setSnackMessage('Incorrect email input');
          setSnackOpen(true);
          return;
        }
      }

      if (ruleId && ruleId > 0) {
        const response: any = await axios.put(Http.update_email_rule_setting, {
          id: ruleId,
          trigger: trigger,
          recipients: recipients,
          show_send_to_buyer: showSendToBuyer ? 1 : 2,
          subject: subject,
          body: body,
        });

        if (response.result) {
          setSnackSeverity('success');
          setSnackMessage('Update successful!');
          setSnackOpen(true);

          await init();
          setPage(2);
        } else {
          setSnackSeverity('error');
          setSnackMessage('Update failed!');
          setSnackOpen(true);
        }
      } else {
        const response: any = await axios.post(Http.create_email_rule_setting, {
          store_id: getStoreId(),
          user_id: getUserId(),
          trigger: trigger,
          recipients: recipients,
          show_send_to_buyer: showSendToBuyer ? 1 : 2,
          subject: subject,
          body: body,
        });

        if (response.result) {
          setSnackSeverity('success');
          setSnackMessage('Save successful!');
          setSnackOpen(true);

          await init();
          setPage(2);
        } else {
          setSnackSeverity('error');
          setSnackMessage('Save failed!');
          setSnackOpen(true);
        }
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const onClickTestEmail = async () => {
    try {
      if (!testEmail) {
        return;
      }

      if (!IsValidEmail(testEmail)) {
        setSnackSeverity('error');
        setSnackMessage('Incorrect email input');
        setSnackOpen(true);
        return;
      }

      const response: any = await axios.get(Http.test_email_setting, {
        params: {
          store_id: getStoreId(),
          user_id: getUserId(),
          email: testEmail,
        },
      });

      if (response.result) {
        setSnackSeverity('success');
        setSnackMessage('Testing successful!');
        setSnackOpen(true);
      } else {
        setSnackSeverity('error');
        setSnackMessage('Testing failed!');
        setSnackOpen(true);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const onClickSaveEmailServer = async () => {
    try {
      if (!smtpServer || !port || !senderEmailAddress || !login || !password) {
        return;
      }

      if (!IsValidEmail(senderEmailAddress)) {
        setSnackSeverity('error');
        setSnackMessage('Incorrect email input');
        setSnackOpen(true);
        return;
      }

      if (id && id > 0) {
        const response: any = await axios.put(Http.update_email_setting, {
          id: id,
          smtp_server: smtpServer,
          port: port,
          sender_email: senderEmailAddress,
          login: login,
          password: password,
          show_tls: showTls ? 1 : 2,
        });

        if (response.result) {
          setSnackSeverity('success');
          setSnackMessage('Update successful!');
          setSnackOpen(true);

          await init();
        } else {
          setSnackSeverity('error');
          setSnackMessage('Update failed!');
          setSnackOpen(true);
        }
      } else {
        const response: any = await axios.post(Http.create_email_setting, {
          store_id: getStoreId(),
          user_id: getUserId(),
          smtp_server: smtpServer,
          port: port,
          sender_email: senderEmailAddress,
          login: login,
          password: password,
          show_tls: showTls ? 1 : 2,
        });

        if (response.result) {
          setSnackSeverity('success');
          setSnackMessage('Save successful!');
          setSnackOpen(true);

          await init();
        } else {
          setSnackSeverity('error');
          setSnackMessage('Save failed!');
          setSnackOpen(true);
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
    try {
      const response: any = await axios.get(Http.find_email_setting, {
        params: {
          store_id: getStoreId(),
          user_id: getUserId(),
        },
      });

      if (response.result) {
        setId(response.data.id);
        setLogin(response.data.login);
        setPassword(response.data.password);
        setPort(response.data.port);
        setSenderEmailAddress(response.data.sender_email);
        setShowTls(response.data.show_tls === 1 ? true : false);
        setSmtpServer(response.data.smtp_server);
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
    <Box>
      {page === 1 && (
        <Box>
          <Typography variant="h6">Email Server</Typography>
          <Box mt={2}>
            <Typography mb={1}>SMTP Server</Typography>
            <TextField
              fullWidth
              hiddenLabel
              size="small"
              value={smtpServer}
              onChange={(e: any) => {
                setSmtpServer(e.target.value);
              }}
            />
          </Box>

          <Box mt={2}>
            <Typography mb={1}>Port</Typography>
            <FormControl fullWidth variant="outlined">
              <OutlinedInput
                size={'small'}
                type="number"
                aria-describedby="outlined-weight-helper-text"
                inputProps={{
                  'aria-label': 'weight',
                }}
                value={port}
                onChange={(e: any) => {
                  setPort(e.target.value);
                }}
              />
            </FormControl>
          </Box>
          <Box mt={2}>
            <Typography mb={1}>Sender&apos;s Email Address</Typography>
            <FormControl fullWidth variant="outlined">
              <OutlinedInput
                size={'small'}
                aria-describedby="outlined-weight-helper-text"
                inputProps={{
                  'aria-label': 'weight',
                }}
                value={senderEmailAddress}
                onChange={(e: any) => {
                  setSenderEmailAddress(e.target.value);
                }}
              />
            </FormControl>
          </Box>
          <Box mt={2}>
            <Typography mb={1}>Login</Typography>
            <FormControl fullWidth variant="outlined">
              <OutlinedInput
                size={'small'}
                aria-describedby="outlined-weight-helper-text"
                inputProps={{
                  'aria-label': 'weight',
                }}
                value={login}
                onChange={(e: any) => {
                  setLogin(e.target.value);
                }}
              />
            </FormControl>
            <Typography fontSize={14}>
              For many email providers (like Gmail) your login is your email address.
            </Typography>
          </Box>
          <Box mt={2}>
            <Typography mb={1}>Password</Typography>
            <FormControl fullWidth variant="outlined">
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
                value={password}
                onChange={(e: any) => {
                  setPassword(e.target.value);
                }}
              />
            </FormControl>
          </Box>
          <Stack direction={'row'} alignItems={'center'} mt={2}>
            <Switch
              checked={showTls}
              onChange={() => {
                setShowTls(!showTls);
              }}
            />
            <Typography ml={1}>TLS certificate security checks</Typography>
          </Stack>

          <Box mt={4}>
            <Button variant={'contained'} size="large" onClick={onClickSaveEmailServer} color="success">
              Save
            </Button>
          </Box>

          <Box mt={6}>
            <Typography variant={'h6'}>Testing</Typography>
            <Box mt={2}>
              <Typography mb={1}>To test your settings, enter an email address</Typography>
              <FormControl fullWidth variant="outlined">
                <OutlinedInput
                  size={'small'}
                  aria-describedby="outlined-weight-helper-text"
                  inputProps={{
                    'aria-label': 'weight',
                  }}
                  value={testEmail}
                  onChange={(e: any) => {
                    setTestEmail(e.target.value);
                  }}
                />
              </FormControl>
            </Box>

            <Box mt={4}>
              <Button variant={'contained'} size="large" onClick={onClickTestEmail}>
                Send Test Email
              </Button>
            </Box>
          </Box>

          <Box mt={5}>
            <Typography variant="h6">Email Rules</Typography>
            <Typography mt={1} mb={4}>
              <Link href={'#'}>Email rules</Link> allow CryptoPay Server to send customized emails from your store based
              on events.
            </Typography>
            <Button
              variant={'contained'}
              onClick={() => {
                setPage(2);
              }}
              size="large"
            >
              Configure
            </Button>
          </Box>
        </Box>
      )}

      {page === 2 && (
        <Box>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
            <Typography variant="h6">Email Rules</Typography>
            <Stack direction={'row'} alignItems={'center'} gap={1}>
              <Button
                variant={'contained'}
                onClick={() => {
                  setPage(1);
                }}
              >
                back
              </Button>
              <Button
                variant={'contained'}
                onClick={() => {
                  setPage(3);
                }}
                color="success"
              >
                create email rule
              </Button>
            </Stack>
          </Stack>

          {!id && (
            <Box my={2}>
              <Alert severity="warning">
                <Typography>
                  You need to configure email settings before this feature works.
                  <Link
                    onClick={() => {
                      setPage(1);
                    }}
                    href={'#'}
                  >
                    Configure store email settings.
                  </Link>
                </Typography>
              </Alert>
            </Box>
          )}

          <Typography>
            Email rules allow Cryptopay Server to send customized emails from your store based on events.
          </Typography>

          <Box mt={5}>
            <EmailRuleTable
              setRuleId={setRuleId}
              setTrigger={setTrigger}
              setRecipients={setRecipients}
              setSubject={setSubject}
              setBody={setBody}
              setShowSendToBuyer={setShowSendToBuyer}
              setPage={setPage}
            />
          </Box>
        </Box>
      )}

      {page === 3 && (
        <Box>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
            <Typography variant="h6">Create Email Rule</Typography>
            <Button
              variant={'contained'}
              onClick={() => {
                setPage(2);
                clearData();
              }}
            >
              Cancel
            </Button>
          </Stack>
          <Typography mt={4} mb={1}>
            Tigger*
          </Typography>
          <FormControl hiddenLabel size="small" fullWidth>
            <Select
              value={trigger}
              onChange={(e: any) => {
                setTrigger(e.target.value);
              }}
            >
              {EMAIL_RULE_TIGGER_DATAS &&
                EMAIL_RULE_TIGGER_DATAS.length > 0 &&
                EMAIL_RULE_TIGGER_DATAS.map((item, index) => (
                  <MenuItem value={item.id} key={index}>
                    {item.title}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <Typography fontSize={14}>Choose what event sends the email.</Typography>

          <Box mt={2}>
            <Typography mb={1}>Recipients</Typography>
            <TextField
              fullWidth
              hiddenLabel
              size="small"
              value={recipients}
              onChange={(e: any) => {
                setRecipients(e.target.value);
              }}
            />
            <Typography fontSize={14}>Who to send the email to. For multiple emails, separate with a comma.</Typography>
          </Box>

          <Stack direction={'row'} alignItems={'center'} mt={1}>
            <Checkbox
              checked={showSendToBuyer}
              onChange={() => {
                setShowSendToBuyer(!showSendToBuyer);
              }}
            />
            <Typography>Send the email to the buyer, if email was provided to the invoice</Typography>
          </Stack>

          <Box mt={2}>
            <Typography mb={1}>Subject*</Typography>
            <TextField
              fullWidth
              hiddenLabel
              size="small"
              value={subject}
              onChange={(e: any) => {
                setSubject(e.target.value);
              }}
            />
          </Box>

          <Box mt={2}>
            <Typography mb={1}>Body*</Typography>
            <TextField
              id="outlined-multiline-flexible"
              fullWidth
              hiddenLabel
              size="small"
              multiline
              minRows={10}
              value={body}
              onChange={(e: any) => {
                setBody(e.target.value);
              }}
            />
          </Box>

          <Box mt={5}>
            <Button variant={'contained'} size="large" color="success" onClick={onClickSaveRule}>
              Save
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Emails;

type RowType = {
  id: number;
  rid: number;
  trigger: EMAIL_RULE_TIGGER_DATA;
  triggerid: number;
  to: string;
  subject: string;
  body: string;
  showSendToBuyer: boolean;
};

type TableType = {
  setRuleId: (value: number) => void;
  setTrigger: (value: EMAIL_RULE_TIGGER_DATA) => void;
  setRecipients: (value: string) => void;
  setSubject: (value: string) => void;
  setBody: (value: string) => void;
  setShowSendToBuyer: (value: boolean) => void;
  setPage: (value: number) => void;
};

function EmailRuleTable(props: TableType) {
  const [rows, setRows] = useState<RowType[]>([]);

  const { getUserId } = useUserPresistStore((state) => state);
  const { getStoreId } = useStorePresistStore((state) => state);
  const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);

  const init = async () => {
    try {
      const response: any = await axios.get(Http.find_email_rule_setting, {
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
              trigger: item.trigger,
              triggerid: item.trigger,
              to: item.recipients,
              subject: item.subject,
              body: item.body,
              showSendToBuyer: item.show_send_to_buyer === 1 ? true : false,
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

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onClickDelete = async (id: number) => {
    try {
      const response: any = await axios.put(Http.delete_email_rule_setting_by_id, {
        id: id,
      });

      if (response.result) {
        await init();

        setSnackSeverity('success');
        setSnackMessage('delete Success.');
        setSnackOpen(true);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Trigger</TableCell>
              <TableCell>Customer Email</TableCell>
              <TableCell>To</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows && rows.length > 0 ? (
              <>
                {rows.map((row) => (
                  <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row">
                      {Object.values(EMAIL_RULE_TIGGER_DATAS).find((item) => item.id === row.triggerid)?.title}
                    </TableCell>
                    <TableCell>{row.showSendToBuyer ? <Check color="success" /> : <Clear color={'error'} />}</TableCell>
                    <TableCell>
                      {row.to &&
                        row.to?.split(',').length > 0 &&
                        row.to?.split(',').map((item, index) => <Typography key={index}>{item}</Typography>)}
                    </TableCell>
                    <TableCell>{row.subject}</TableCell>
                    <TableCell align="right">
                      <Button
                        onClick={() => {
                          props.setRuleId(row.rid);
                          props.setTrigger(row.trigger as EMAIL_RULE_TIGGER_DATA);
                          props.setRecipients(row.to);
                          props.setSubject(row.subject);
                          props.setBody(row.body);
                          props.setShowSendToBuyer(row.showSendToBuyer);
                          props.setPage(3);
                        }}
                        color="success"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => {
                          onClickDelete(row.rid);
                        }}
                        color={'error'}
                      >
                        Delete
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
    </>
  );
}
