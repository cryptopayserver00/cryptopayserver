import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  Icon,
  InputAdornment,
  OutlinedInput,
  Stack,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import { BLOCKCHAIN, BLOCKCHAINNAMES, CHAINS, COIN } from 'packages/constants/blockchain';
import { useEffect, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FindChainNamesByChains, GetBlockchainTxUrlByChainIds } from 'utils/web3';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { useSnackPresistStore } from 'lib/store';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import Link from 'next/link';

const FreeCoin = () => {
  const [page, setPage] = useState<number>(1);
  const [blockExplorerLink, setBlockExplorerLink] = useState<string>('');

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore((state) => state);

  const onClickCoin = async (item: COIN, address: string, amount: number) => {
    try {
      const checkout_resp: any = await axios.get(Http.checkout_chain_address, {
        params: {
          chain_id: item.chainId,
          address: address,
          network: 2,
        },
      });

      if (!checkout_resp.result) {
        setSnackSeverity('error');
        setSnackMessage('The input address is invalid, please try it again!');
        setSnackOpen(true);
        return;
      }

      const response: any = await axios.get(Http.get_free_coin, {
        params: {
          amount: amount,
          chain_id: item.chainId,
          coin: item.name,
          address: address,
        },
      });

      if (response.result && response.data && response.data.hash) {
        setBlockExplorerLink(GetBlockchainTxUrlByChainIds(false, item.chainId, response.data.hash));

        setPage(2);
      } else {
        setSnackSeverity('error');
        setSnackMessage('Can not get it, please try it again');
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
    <Box mt={4}>
      <Container>
        <Typography variant="h4" textAlign={'center'}>
          Get Testnet Coin
        </Typography>

        <Box mt={6}>
          {page === 1 && <SelectChainAndCrypto network={2} amount={0} currency={''} onClickCoin={onClickCoin} />}

          {page === 2 && (
            <Box textAlign={'center'} mt={10}>
              <Icon component={CheckCircleIcon} color={'success'} style={{ fontSize: 80 }} />
              <Typography mt={2} fontWeight={'bold'} fontSize={20}>
                Payment Sent
              </Typography>
              <Typography mt={2}>Request sending successfully</Typography>
              <Link href={blockExplorerLink} target="_blank">
                <Stack direction={'row'} alignItems={'center'} justifyContent={'center'} mt={2}>
                  <Icon component={RemoveRedEyeIcon} />
                  <Typography ml={1}>View on Block Explorer</Typography>
                </Stack>
              </Link>
              <Box mt={10}>
                <Button
                  size={'large'}
                  variant={'contained'}
                  style={{ width: 500 }}
                  onClick={() => {
                    setPage(1);
                  }}
                >
                  Done
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default FreeCoin;

type SelectType = {
  network: number;
  amount: number;
  currency: string;
  onClickCoin: (item: COIN, address: string, amount: number) => Promise<void>;
};

type RowType = {
  id: number;
  chainId: number;
  isMainnet: boolean;
  name: string;
  address: string;
};

const SelectChainAndCrypto = (props: SelectType) => {
  const [expanded, setExpanded] = useState<string | false>(false);
  const [blockchain, setBlcokchain] = useState<BLOCKCHAIN[]>([]);
  const [selectCoinItem, setSelectCoinItem] = useState<COIN>();
  const [rows, setRows] = useState<RowType[]>([]);

  const [open, setOpen] = useState<boolean>(false);
  const [address, setAddress] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  useEffect(() => {
    const value = BLOCKCHAINNAMES.filter((item: any) => (props.network === 1 ? item.isMainnet : !item.isMainnet));
    setBlcokchain(value);
  }, [props.network]);

  const handleOpen = async (chainId: number) => {
    try {
      const response: any = await axios.get(Http.find_address_book, {
        params: {
          network: props.network,
          chain_id: chainId,
        },
      });
      if (response.result && response.data.length > 0) {
        let rt: RowType[] = [];
        response.data.forEach((item: any) => {
          rt.push({
            id: item.id,
            chainId: item.chain_id,
            isMainnet: item.network === 1 ? true : false,
            name: item.name,
            address: item.address,
          });
        });

        setRows(rt);
      }
    } catch (e) {
      console.error(e);
    }

    setOpen(true);
  };

  const handleClose = () => {
    setAddress('');
    setAmount(0);
    setRows([]);

    setOpen(false);
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant={'h5'} textAlign={'center'} mt={1}>
            Select Chain and Crypto
          </Typography>
        </CardContent>
      </Card>
      <Box mt={2}>
        {blockchain &&
          blockchain.length > 0 &&
          blockchain.map((item, index) => (
            <Accordion expanded={expanded === item.name} onChange={handleChange(item.name)} key={index}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1bh-content">
                <Typography sx={{ width: '33%', flexShrink: 0 }} fontWeight={'bold'}>
                  {item.name.toUpperCase()}
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>{item.desc}</Typography>
              </AccordionSummary>
              {item.coins &&
                item.coins.length > 0 &&
                item.coins.map((coinItem, coinIndex) => (
                  <AccordionDetails key={coinIndex}>
                    <Button
                      fullWidth
                      onClick={async () => {
                        setSelectCoinItem(coinItem);

                        await handleOpen(coinItem.chainId);
                      }}
                    >
                      <Image src={coinItem.icon} alt="icon" width={50} height={50} />
                      <Typography ml={2}>{coinItem.name}</Typography>
                    </Button>
                  </AccordionDetails>
                ))}
            </Accordion>
          ))}
      </Box>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth
      >
        <DialogTitle id="alert-dialog-title">Claim free funds</DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <FormControl variant="outlined" fullWidth size={'small'}>
              <OutlinedInput
                type="text"
                endAdornment={
                  <InputAdornment position="end">
                    {FindChainNamesByChains(selectCoinItem?.chainId as CHAINS)}
                  </InputAdornment>
                }
                aria-describedby="outlined-weight-helper-text"
                inputProps={{
                  'aria-label': 'weight',
                }}
                value={address}
                onChange={(e: any) => {
                  setAddress(e.target.value);
                }}
                placeholder="Enter your address"
              />
            </FormControl>
          </Box>

          <Box>
            {rows &&
              rows.length > 0 &&
              rows.map((item, index) => (
                <Box mb={2}>
                  <Chip
                    key={index}
                    label={item.address}
                    variant="outlined"
                    onClick={() => {
                      setAddress(item.address);
                    }}
                  />
                </Box>
              ))}
          </Box>

          <Box mb={2}>
            <FormControl variant="outlined" fullWidth size={'small'}>
              <OutlinedInput
                type="number"
                endAdornment={<InputAdornment position="end">{props.currency}</InputAdornment>}
                aria-describedby="outlined-weight-helper-text"
                inputProps={{
                  'aria-label': 'weight',
                }}
                value={amount}
                onChange={(e: any) => {
                  setAmount(e.target.value);
                }}
                placeholder='Enter you amount'
              />
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant={'outlined'} onClick={handleClose}>
            Close
          </Button>
          <Button
            variant={'contained'}
            onClick={async () => {
              await props.onClickCoin(selectCoinItem as COIN, address, amount);
              handleClose();
            }}
          >
            Claim Funds
          </Button>
        </DialogActions>
      </Dialog>

      {/* {selectCoinItem && (
        <Box mt={2}>
          <Card>
            <CardContent>
              <Grid container mt={2} gap={1} justifyContent={'space-between'} alignItems={'center'}>
                <Grid item xs={5}>
                  <FormControl variant="outlined" fullWidth>
                    <OutlinedInput
                      type="text"
                      endAdornment={
                        <InputAdornment position="end">{FindChainNamesByChains(selectCoinItem.chainId)}</InputAdornment>
                      }
                      aria-describedby="outlined-weight-helper-text"
                      inputProps={{
                        'aria-label': 'weight',
                      }}
                      value={address}
                      onChange={(e: any) => {
                        setAddress(e.target.value);
                      }}
                      placeholder="Enter your address"
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={3}>
                  <FormControl variant="outlined" fullWidth>
                    <OutlinedInput
                      type="number"
                      endAdornment={<InputAdornment position="end">{props.currency}</InputAdornment>}
                      aria-describedby="outlined-weight-helper-text"
                      inputProps={{
                        'aria-label': 'weight',
                      }}
                      value={amount}
                      onChange={(e: any) => {
                        setAmount(e.target.value);
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={3}>
                  <Button
                    size={'large'}
                    variant={'contained'}
                    fullWidth
                    onClick={async () => {
                      await props.onClickCoin(selectCoinItem, address, amount);
                    }}
                  >
                    Claim Funds
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )} */}
    </Box>
  );
};
