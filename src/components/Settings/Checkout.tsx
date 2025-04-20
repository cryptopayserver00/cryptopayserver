import { Box, Button, MenuItem, Select, Stack, Switch, TextField, Typography } from '@mui/material';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from 'lib/store';
import { LANGUAGES } from 'packages/constants';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';

const Checkout = () => {
  const { getStoreId } = useStorePresistStore((state) => state);
  const { getUserId } = useUserPresistStore((state) => state);
  const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);

  const [id, setId] = useState<number>(0);
  const [customHtmlTitle, setCustomHtmlTitle] = useState<string>('');
  const [language, setLanguage] = useState<string>('');
  const [showDetectLanguage, setShowDetectLanguage] = useState<boolean>(false);
  const [showPayInWalletButton, setShowPayInWalletButton] = useState<boolean>(false);
  const [showPaymentConfetti, setShowPaymentConfetti] = useState<boolean>(false);
  const [showPaymentList, setShowPaymentList] = useState<boolean>(false);
  const [showPaymentMethod, setShowPaymentMethod] = useState<boolean>(false);
  const [showPublicReceiptPage, setShowPublicReceiptPage] = useState<boolean>(false);
  const [showQrcodeReceipt, setShowQrcodeReceipt] = useState<boolean>(false);
  const [showRedirectUrl, setShowRedirectUrl] = useState<boolean>(false);
  const [showSound, setShowSound] = useState<boolean>(false);
  const [supportUrl, setSupportUrl] = useState<string>('');
  const [showHeader, setShowHeader] = useState<boolean>(false);

  const init = async () => {
    try {
      const response: any = await axios.get(Http.find_checkout_setting_by_id, {
        params: {
          store_id: getStoreId(),
          user_id: getUserId(),
        },
      });

      if (response.result) {
        setId(response.data.id);
        setShowPaymentConfetti(response.data.show_payment_confetti === 1 ? true : false);
        setShowSound(response.data.show_sound === 1 ? true : false);
        setShowPayInWalletButton(response.data.show_pay_in_wallet_button === 1 ? true : false);
        setCustomHtmlTitle(response.data.custom_html_title);
        setLanguage(response.data.language);
        setShowDetectLanguage(response.data.show_detect_language === 1 ? true : false);
        setSupportUrl(response.data.support_url);
        setShowPaymentMethod(response.data.show_payment_method === 1 ? true : false);
        setShowRedirectUrl(response.data.show_redirect_url === 1 ? true : false);
        setShowPublicReceiptPage(response.data.show_public_receipt_page === 1 ? true : false);
        setShowPaymentList(response.data.show_payment_list === 1 ? true : false);
        setShowQrcodeReceipt(response.data.show_qrcode_receipt === 1 ? true : false);
        setShowHeader(response.data.show_header === 1 ? true : false);
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

  const onClickSave = async () => {
    try {
      const response: any = await axios.put(Http.update_checkout_setting_by_id, {
        id: id,
        show_payment_confetti: showPaymentConfetti ? 1 : 2,
        show_sound: showSound ? 1 : 2,
        show_pay_in_wallet_button: showPayInWalletButton ? 1 : 2,
        show_detect_language: showDetectLanguage ? 1 : 2,
        language: language,
        custom_html_title: customHtmlTitle,
        support_url: supportUrl,
        show_payment_method: showPaymentMethod ? 1 : 2,
        show_redirect_url: showRedirectUrl ? 1 : 2,
        show_public_receipt_page: showPublicReceiptPage ? 1 : 2,
        show_payment_list: showPaymentList ? 1 : 2,
        show_qrcode_receipt: showQrcodeReceipt ? 1 : 2,
        show_header: showHeader ? 1 : 2,
      });

      if (response.result) {
        setSnackSeverity('success');
        setSnackMessage('Save successful!');
        setSnackOpen(true);

        await init();
      } else {
        setSnackSeverity('error');
        setSnackMessage('The update failed, please try again later.');
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
    <Box>
      <Box>
        <Typography variant="h6">Checkout</Typography>
        <Stack direction={'row'} mt={4} alignItems={'center'}>
          <Switch
            checked={showPaymentConfetti}
            onChange={() => {
              setShowPaymentConfetti(!showPaymentConfetti);
            }}
          />
          <Typography ml={1}>Celebrate payment with confetti</Typography>
        </Stack>
        <Stack direction={'row'} alignItems={'center'}>
          <Switch
            checked={showSound}
            onChange={() => {
              setShowSound(!showSound);
            }}
          />
          <Typography ml={1}>Enable sounds on checkout page</Typography>
        </Stack>
        <Stack direction={'row'} alignItems={'center'}>
          <Switch
            checked={showHeader}
            onChange={() => {
              setShowHeader(!showHeader);
            }}
          />
          <Typography ml={1}>Show the store header</Typography>
        </Stack>
        <Stack direction={'row'} alignItems={'center'}>
          <Switch
            checked={showPayInWalletButton}
            onChange={() => {
              setShowPayInWalletButton(!showPayInWalletButton);
            }}
          />
          <Typography ml={1}>Show &quot;Pay in wallet&quot; button</Typography>
        </Stack>
        <Stack direction={'row'} alignItems={'center'} mt={1}>
          <Switch
            checked={showDetectLanguage}
            onChange={() => {
              setShowDetectLanguage(!showDetectLanguage);
            }}
          />
          <Box ml={1}>
            <Typography>Auto-detect language on checkout</Typography>
            <Typography mt={1}>Detects the language of the customer&apos;s browser.</Typography>
          </Box>
        </Stack>

        <Box mt={5}>
          <Typography>Default language on checkout</Typography>
          <Box mt={1}>
            <Select
              size={'small'}
              inputProps={{ 'aria-label': 'Without label' }}
              style={{ width: 200 }}
              value={language}
              onChange={(e: any) => {
                setLanguage(e.target.value);
              }}
            >
              {LANGUAGES &&
                LANGUAGES.length > 0 &&
                LANGUAGES.map((item, index) => (
                  <MenuItem value={item.name} key={index}>
                    {item.name}
                  </MenuItem>
                ))}
            </Select>
          </Box>

          <Box mt={3}>
            <Typography>Custom HTML title to display on Checkout page</Typography>
            <Box mt={1}>
              <TextField
                fullWidth
                hiddenLabel
                value={customHtmlTitle}
                onChange={(e: any) => {
                  setCustomHtmlTitle(e.target.value);
                }}
                size="small"
              />
            </Box>
          </Box>

          <Box mt={3}>
            <Typography>Support URL</Typography>
            <Box mt={1}>
              <TextField
                fullWidth
                hiddenLabel
                value={supportUrl}
                onChange={(e: any) => {
                  setSupportUrl(e.target.value);
                }}
                size="small"
              />
            </Box>
            <Typography mt={1} fontSize={14}>
              For support requests related to partially paid invoices. A &apos;Contact Us&apos; button with this link
              will be shown on the invoice expired page. Can be any valid URI, such as a website, email, and Nostr.
            </Typography>
          </Box>

          <Box mt={4}>
            <Stack direction={'row'} alignItems={'center'}>
              <Switch
                checked={showPaymentMethod}
                onChange={() => {
                  setShowPaymentMethod(!showPaymentMethod);
                }}
              />
              <Typography ml={1}>Only enable the payment method after user explicitly chooses it</Typography>
            </Stack>
            <Stack direction={'row'} alignItems={'center'}>
              <Switch
                checked={showRedirectUrl}
                onChange={() => {
                  setShowRedirectUrl(!showRedirectUrl);
                }}
              />
              <Typography ml={1}>Redirect invoice to redirect url automatically after paid</Typography>
            </Stack>
          </Box>
        </Box>
      </Box>

      <Box mt={5}>
        <Typography variant="h6">Public receipt</Typography>
        <Box mt={5}>
          <Stack direction={'row'} alignItems={'center'}>
            <Switch
              checked={showPublicReceiptPage}
              onChange={() => {
                setShowPublicReceiptPage(!showPublicReceiptPage);
              }}
            />
            <Typography ml={1}>Enable public receipt page for settled invoices</Typography>
          </Stack>
          <Stack direction={'row'} alignItems={'center'}>
            <Switch
              checked={showPaymentList}
              onChange={() => {
                setShowPaymentList(!showPaymentList);
              }}
            />
            <Typography ml={1}>Show the payment list in the public receipt page</Typography>
          </Stack>
          <Stack direction={'row'} alignItems={'center'}>
            <Switch
              checked={showQrcodeReceipt}
              onChange={() => {
                setShowQrcodeReceipt(!showQrcodeReceipt);
              }}
            />
            <Typography ml={1}>Show the QR code of the receipt in the public receipt page</Typography>
          </Stack>
        </Box>

        <Box mt={4}>
          <Button variant={'contained'} size="large" onClick={onClickSave} color="success">
            Save
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Checkout;
