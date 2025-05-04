import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
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
  Icon,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore, useWalletPresistStore } from 'lib/store';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { AccountBalanceWallet, ExpandMore, ReportGmailerrorred } from '@mui/icons-material';
import Image from 'next/image';
import { BLOCKCHAINNAMES, CHAINNAMES, CHAINS, COINS } from 'packages/constants/blockchain';

type blockchainCoinType = {
  chainId: CHAINS;
  icon: any;
  name: COINS;
  isMainCoin: boolean;
  address: string;
  enabled: boolean;
  scan: boolean;
};

type blockchainType = {
  icon: any;
  name: CHAINNAMES;
  desc: string;
  coins: blockchainCoinType[];
};

const ManageWallet = () => {
  const [openExplain, setOpenExplain] = useState<boolean>(false);

  const [walletName, setWalletName] = useState<string>('');
  const [newWalletName, setNewWalletName] = useState<string>('');
  const [isBackup, setIsBackup] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  const [blockchain, setBlcokchain] = useState<blockchainType[]>([]);

  const { getWalletId } = useWalletPresistStore((state) => state);
  const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);
  const { getUserId, getNetwork } = useUserPresistStore((state) => state);
  const { getStoreId } = useStorePresistStore((state) => state);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setNewWalletName('');

    setOpen(false);
  };

  const getWalletInfo = async () => {
    try {
      const response: any = await axios.get(Http.find_wallet_by_id, {
        params: {
          id: getWalletId(),
        },
      });

      if (response.result && response.data) {
        setWalletName(response.data.name);
        setIsBackup(response.data.is_backup === 1 ? true : false);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const onClickRename = async () => {
    try {
      if (!newWalletName || newWalletName === '') {
        setSnackSeverity('error');
        setSnackMessage('Incorrect name input');
        setSnackOpen(true);
        return;
      }

      const response: any = await axios.put(Http.update_name_by_wallet_id, {
        wallet_id: getWalletId(),
        name: newWalletName,
      });
      if (response.result) {
        await getWalletInfo();
        handleClose();

        setSnackSeverity('success');
        setSnackMessage('Successful update!');
        setSnackOpen(true);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const onChangeCoin = async (chainId: CHAINS, coinName: COINS) => {
    try {
      const response: any = await axios.put(Http.update_wallet_coin_enable_by_id, {
        user_id: getUserId(),
        store_id: getStoreId(),
        chain_id: chainId,
        name: coinName,
        network: getNetwork() === 'mainnet' ? 1 : 2,
      });

      if (response.result) {
        await getWalletManage();

        setSnackSeverity('success');
        setSnackMessage('Update successful!');
        setSnackOpen(true);
      } else {
        setSnackSeverity('error');
        setSnackMessage('Update failed!');
        setSnackOpen(true);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const getWalletManage = async () => {
    try {
      const response: any = await axios.get(Http.find_wallet_manage_by_network, {
        params: {
          wallet_id: getWalletId(),
          store_id: getStoreId(),
          network: getNetwork() === 'mainnet' ? 1 : 2,
        },
      });
      if (response.result) {
        const respBalances = response.data.balances;
        const respCoins = response.data.coins;
        const respScan = response.data.scan;

        const blockchain = BLOCKCHAINNAMES.filter((item) =>
          getNetwork() === 'mainnet' ? item.isMainnet : !item.isMainnet,
        );

        let blockchains: blockchainType[] = [];
        for (const chain of blockchain) {
          let blockchain: blockchainType = {
            icon: chain.icon,
            name: chain.name,
            desc: chain.desc,
            coins: [],
          };

          let coins: blockchainCoinType[] = [];
          for (const coin of chain.coins) {
            let blockchainCoin: blockchainCoinType = {
              chainId: coin.chainId,
              icon: coin.icon,
              name: coin.name,
              isMainCoin: coin.isMainCoin,
              address: '',
              enabled: false,
              scan: false,
            };

            const findBalance = respBalances?.find((item: any) => item.chain_id === coin.chainId);
            blockchainCoin.address = findBalance.address ? findBalance?.address : '';
            blockchainCoin.enabled = respCoins?.find(
              (item: any) => item.chain_id === coin.chainId && item.name === coin.name,
            ).enabled;

            if (respScan.result) {
              blockchainCoin.scan = true;
            } else {
              const hasScan = respScan.data?.find(
                (item: any) => item.chain_id === coin.chainId && item.address === blockchainCoin.address,
              );

              blockchainCoin.scan = hasScan ? false : true;
            }

            coins.push(blockchainCoin);
          }

          blockchain.coins = coins;
          blockchains.push(blockchain);
        }

        setBlcokchain(blockchains);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const init = async () => {
    await getWalletInfo();
    await getWalletManage();
  };

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onClickRefresh = async () => {
    await getWalletManage();
  };

  return (
    <Box>
      <Container>
        <Typography variant="h6">Wallet Manage</Typography>

        <Box mt={4}>
          <Card>
            <CardContent>
              <Stack direction={'row'} alignItems={'flex-start'} justifyContent={'space-between'}>
                <Stack direction={'row'} alignItems={'center'}>
                  <Icon component={AccountBalanceWallet} fontSize={'large'} />
                  <Typography fontWeight={'bold'} px={2}>
                    {walletName ? walletName : 'UNKOWN NAME'}
                  </Typography>
                  <Chip color={isBackup ? 'success' : 'error'} label={isBackup ? 'Backed up' : 'Not backed up'} />
                </Stack>
                <Stack direction={'row'} alignItems={'center'} gap={1}>
                  <Button variant={'contained'} onClick={handleOpen}>
                    Rename wallet
                  </Button>
                  <Button
                    color="success"
                    variant={'contained'}
                    onClick={() => {
                      window.location.href = '/wallet/phrase/intro';
                    }}
                  >
                    Go back up
                  </Button>
                </Stack>
              </Stack>

              <Box mt={4}>
                <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} pb={2}>
                  <Stack direction={'row'} alignItems={'center'}>
                    <Typography variant="h6">Coin Manage</Typography>
                    <IconButton
                      onClick={() => {
                        setOpenExplain(!openExplain);
                      }}
                    >
                      <ReportGmailerrorred />
                    </IconButton>
                  </Stack>

                  <Button variant={'contained'} color={'success'} onClick={onClickRefresh}>
                    Refresh
                  </Button>
                </Stack>

                {openExplain && (
                  <Alert severity="info">
                    <AlertTitle>Info</AlertTitle>
                    Refresh: All data of the blockchain tokens will be refreshed.
                    <br />
                    <br />
                    Scanned or no scan: Whether the address used by this coin is within the scanning range; if within
                    the range, it will be processed for creating the order. "Scanned" indicates it exists, "No Scan"
                    indicates it does not exist.
                    <br />
                    <br />
                    Enable or Disable: Click the following button to enable or disable the display of this token,
                    involving all the users who create invoices.
                  </Alert>
                )}

                {blockchain &&
                  blockchain.length > 0 &&
                  blockchain.map((item, index) => (
                    <Accordion defaultExpanded={index === 0 || index === 1 ? true : false} key={index}>
                      <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel1-content">
                        <Stack direction={'row'} alignItems={'center'} gap={2}>
                          <Image src={item.icon} alt="icon" width={40} height={40} />
                          <Typography>{item.name}</Typography>
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography>{item.desc}</Typography>
                        <Typography py={2} fontWeight={'bold'} color={'orange'}>
                          Click the following button to enable or disable the display of this token
                        </Typography>
                        {item.coins &&
                          item.coins.length > 0 &&
                          item.coins.map((coinItem, coinIndex) => (
                            <Stack
                              direction={'row'}
                              alignItems={'center'}
                              justifyContent={'space-between'}
                              pb={2}
                              key={coinIndex}
                            >
                              <Stack direction={'row'} alignItems={'center'} gap={2}>
                                <Image src={coinItem.icon} alt="icon" width={40} height={40} />
                                <Typography>{coinItem.name}</Typography>
                                {coinItem.isMainCoin && <Chip color={'info'} label={'main coin'} variant={'filled'} />}

                                {coinItem.scan ? (
                                  <Chip color="success" label={'Scanned'} variant={'filled'} />
                                ) : (
                                  <Chip color="error" label={'No Scan'} variant={'filled'} />
                                )}
                              </Stack>
                              <Switch
                                checked={coinItem.enabled}
                                onChange={() => {
                                  onChangeCoin(coinItem.chainId, coinItem.name);
                                }}
                              />
                            </Stack>
                          ))}
                      </AccordionDetails>
                    </Accordion>
                  ))}
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullWidth
        >
          <DialogTitle id="alert-dialog-title">Rename Wallet</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              required
              margin="dense"
              type={'text'}
              fullWidth
              variant="standard"
              value={newWalletName}
              onChange={(e: any) => {
                setNewWalletName(e.target.value);
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button variant={'contained'} onClick={handleClose}>
              Close
            </Button>
            <Button variant={'contained'} onClick={onClickRename} color="success">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default ManageWallet;
