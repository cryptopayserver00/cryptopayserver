import { KeyboardArrowDown, Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Checkbox,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from 'lib/store';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';

const Emails = () => {
  const [isConfigure, setIsConfigure] = useState<boolean>(false);
  const [id, setId] = useState<number>(0);
  const [smtpServer, setSmtpServer] = useState<string>('');
  const [port, setPort] = useState<number>(0);
  const [senderEmailAddress, setSenderEmailAddress] = useState<string>('');
  const [login, setLogin] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showTls, setShowTls] = useState<boolean>(false);
  const [testEmail, setTestEmail] = useState<string>('');

  const [ruleId, setRuleId] = useState<number>(0);
  const [tigger, setTigger] = useState<number>(1);
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

  const onClickSaveRule = async () => {
    try {
      if (ruleId && ruleId > 0) {
        const response: any = await axios.put(Http.update_email_rule_setting, {
          store_id: getStoreId(),
          user_id: getUserId(),
          id: ruleId,
          tigger: tigger,
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
        } else {
          setSnackSeverity('error');
          setSnackMessage('Update failed!');
          setSnackOpen(true);
        }
      } else {
        const response: any = await axios.post(Http.create_email_rule_setting, {
          store_id: getStoreId(),
          user_id: getUserId(),
          tigger: tigger,
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

  const onClickTestEmail = async () => {};

  const onClickSave = async () => {
    try {
      if (id && id > 0) {
        const response: any = await axios.put(Http.update_email_setting, {
          store_id: getStoreId(),
          user_id: getUserId(),
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

      if (response.result && response.data.length === 1) {
        setId(response.data[0].id);
        setLogin(response.data[0].login);
        setPassword(response.data[0].password);
        setPort(response.data[0].port);
        setSenderEmailAddress(response.data[0].sender_email);
        setShowTls(response.data[0].show_tls === 1 ? true : false);
        setSmtpServer(response.data[0].smtp_server);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }

    try {
      const response: any = await axios.get(Http.find_email_rule_setting, {
        params: {
          store_id: getStoreId(),
          user_id: getUserId(),
        },
      });

      if (response.result && response.data.length === 1) {
        setRuleId(response.data[0].id);
        setTigger(response.data[0].tigger);
        setRecipients(response.data[0].recipients);
        setShowSendToBuyer(response.data[0].show_send_to_buyer === 1 ? true : false);
        setSubject(response.data[0].subject);
        setBody(response.data[0].body);
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
      <Box>
        <Stack direction={'row'} justifyContent={'space-between'}>
          <Typography variant="h6">Email Rules</Typography>
          {isConfigure ? (
            <Button
              variant={'contained'}
              onClick={() => {
                onClickSaveRule();
              }}
            >
              Save
            </Button>
          ) : (
            <Button
              variant={'contained'}
              onClick={() => {
                setIsConfigure(true);
              }}
            >
              Configure
            </Button>
          )}
        </Stack>
        <Typography mt={3}>
          <Link href={'#'}>Email rules</Link> allow CryptoPay Server to send customized emails from your store based on
          events.
        </Typography>
      </Box>

      {isConfigure ? (
        <Box mt={5}>
          <Typography>Tigger*</Typography>
          <FormControl hiddenLabel size="small" fullWidth>
            <Select
              value={tigger}
              onChange={(e: any) => {
                setTigger(e.target.value);
              }}
            >
              <MenuItem value={1}>A new invoice has been created</MenuItem>
              <MenuItem value={2}>A new payment has been received</MenuItem>
              <MenuItem value={3}>A payment has been settled</MenuItem>
              <MenuItem value={4}>An invoice is processing</MenuItem>
              <MenuItem value={5}>An invoice has expired</MenuItem>
              <MenuItem value={6}>An invoice has been settled</MenuItem>
              <MenuItem value={7}>An invoice became invalid</MenuItem>
              <MenuItem value={8}>A payout has been created</MenuItem>
              <MenuItem value={9}>A payout has been approved</MenuItem>
              <MenuItem value={10}>A payout was updated</MenuItem>
              <MenuItem value={11}>Payment Request Created</MenuItem>
              <MenuItem value={12}>Payment Request Updated</MenuItem>
              <MenuItem value={13}>Payment Request Archived</MenuItem>
              <MenuItem value={14}>Payment Request Status Changed</MenuItem>
            </Select>
          </FormControl>
          <Typography fontSize={14}>Choose what event sends the email.</Typography>

          <Box mt={2}>
            <Typography>Recipients</Typography>
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
            <Typography>Subject*</Typography>
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
            <Typography>Body*</Typography>
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
            <Button variant={'contained'} size="large">
              Test
            </Button>
          </Box>
        </Box>
      ) : (
        <Box>
          <Box mt={5}>
            <Typography variant="h6">Email Server</Typography>

            <Box mt={2}>
              <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                <Typography>SMTP Server</Typography>
                {/* <Button
              aria-controls={open ? 'demo-positioned-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              onClick={handleClick}
              endIcon={<KeyboardArrowDown />}
            >
              Quick Fill
            </Button>
            <Menu
              aria-labelledby="demo-positioned-button"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
            >
              <MenuItem onClick={handleClose}>Gamil.com</MenuItem>
              <MenuItem onClick={handleClose}>Yahoo.com</MenuItem>
              <MenuItem onClick={handleClose}>Outlook.com</MenuItem>
            </Menu> */}
              </Stack>
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
              <Typography>Port</Typography>
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
              <Typography>Sender&apos;s Email Address</Typography>
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
              <Typography>Login</Typography>
              <Box mt={1}>
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
              </Box>
              <Typography fontSize={14}>
                For many email providers (like Gmail) your login is your email address.
              </Typography>
            </Box>
            <Box mt={2}>
              <Typography>Password</Typography>
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
              <Button variant={'contained'} size="large" onClick={onClickSave}>
                Save
              </Button>
            </Box>
          </Box>

          <Box mt={6}>
            <Typography variant={'h6'}>Testing</Typography>
            <Box mt={2}>
              <Typography>To test your settings, enter an email address</Typography>
              <FormControl fullWidth variant="outlined">
                <OutlinedInput
                  size={'small'}
                  aria-describedby="outlined-weight-helper-text"
                  inputProps={{
                    'aria-label': 'weight',
                  }}
                  value={testEmail}
                  onChange={(e) => {
                    setTestEmail(testEmail);
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
        </Box>
      )}
    </Box>
  );
};

export default Emails;
