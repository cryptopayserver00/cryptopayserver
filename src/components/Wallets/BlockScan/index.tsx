import { Box, Button, Card, CardContent, Container, Stack, Typography } from '@mui/material';
import { useSnackPresistStore, useUserPresistStore, useWalletPresistStore } from 'lib/store';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import Image from 'next/image';
import { BLOCKCHAIN, BLOCKCHAINNAMES, CHAINS } from 'packages/constants/blockchain';
import Link from 'next/link';
import { GetBlockchainAddressUrlByChainIds } from 'utils/web3';

type walletType = {
  id: number;
  address: string;
  type: string;
  network: number;
  chainId: number;
};

const BlockScan = () => {
  const { getUserId, getNetwork } = useUserPresistStore((state) => state);
  const { getWalletId } = useWalletPresistStore((state) => state);
  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

  const [wallet, setWallet] = useState<walletType[]>([]);
  const [blockchain, setBlcokchain] = useState<BLOCKCHAIN[]>([]);

  const checkScanStatus = async () => {
    try {
      const response: any = await axios.post(Http.create_wallet_to_block_scan, {
        user_id: getUserId(),
        wallet_id: getWalletId(),
      });

      if (response.result) {
        setSnackSeverity('success');
        setSnackMessage('Verification success, all addresses have been added to the queue');
        setSnackOpen(true);
      } else {
        setSnackSeverity('error');
        setSnackMessage('Some addresses cannot join the Sweeping Quest, please try again');
        setSnackOpen(true);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('Some addresses cannot join the Sweeping Quest, please try again');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const checkNetworkStatus = async () => {
    await getNetworkInfo();
  };

  const checkRequestTime = async (url: string): Promise<number> => {
    const start = performance.now();
    try {
      await axios.get(url);
    } catch (e) {
      return 0;
    }

    const end = performance.now();
    return end - start;
  };

  const getWalletAddress = async () => {
    try {
      const response: any = await axios.get(Http.find_wallet_address_by_network, {
        params: {
          user_id: getUserId(),
          wallet_id: getWalletId(),
          network: getNetwork() === 'mainnet' ? 1 : 2,
        },
      });

      if (response.result) {
        if (response.data.length > 0) {
          let ws: walletType[] = [];
          response.data.forEach(async (item: any) => {
            ws.push({
              id: item.id,
              address: item.address,
              type: item.chain_id === CHAINS.BITCOIN ? 'BITCOIN ' + item.note : item.note,
              network: item.network,
              chainId: item.chain_id,
            });
          });
          setWallet(ws);
        } else {
          setWallet([]);
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

  const getNetworkInfo = async () => {
    const value = BLOCKCHAINNAMES.filter((item) => (getNetwork() === 'mainnet' ? item.isMainnet : !item.isMainnet));
    // value.forEach(async (item) => {
    // if (item.rpc) {
    //   const time = await checkRequestTime(item.rpc[0]);
    //   if (time === 0) {
    //     setSnackSeverity('error');
    //     setSnackMessage('The network error occurred. Please try again later.');
    //     setSnackOpen(true);
    //     return;
    //   }
    //   item.time = parseInt(time.toString());
    // }
    // item.time = 0;
    // });

    setBlcokchain(value);
  };

  const init = async () => {
    await getWalletAddress();
    await getNetworkInfo();
    await checkScanStatus();
  };

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box>
      <Container>
        <Typography variant="h6">Blockchain Scan</Typography>

        <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={4}>
          <Typography variant="h6">Wallet Address</Typography>
          <Stack direction={'row'} alignItems={'center'}>
            <Button variant={'contained'} onClick={checkScanStatus} color='success'>
              Check Scan Status
            </Button>
          </Stack>
        </Stack>

        <Box mt={4}>
          {wallet &&
            wallet.length > 0 &&
            wallet.map((item, index) => (
              <Box key={index} mb={4}>
                <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                  <Box>
                    <Typography fontWeight={'bold'} fontSize={14}>
                      {item.type}
                    </Typography>
                    <Typography mt={1}>{item.address}</Typography>
                  </Box>
                </Stack>
              </Box>
            ))}
        </Box>

        <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={4}>
          <Typography variant="h6">Network</Typography>
          <Stack direction={'row'} alignItems={'center'}>
            <Button variant={'contained'} onClick={checkNetworkStatus} color='success'>
              Check network Status
            </Button>
          </Stack>
        </Stack>

        {blockchain &&
          blockchain.map((item, index) => (
            <Box mt={4} key={index}>
              <Card>
                <CardContent>
                  <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} p={2}>
                    <Stack direction={'row'}>
                      <Image src={item.icon} alt="image" width={50} height={50} />
                      <Box ml={2}>
                        <Typography fontSize={16} fontWeight={'bold'}>
                          {item.name}
                        </Typography>
                        <Typography fontSize={16} fontWeight={'bold'}>
                          {item.desc}
                        </Typography>

                        <Stack direction={'row'} mt={2} gap={2}>
                          <Button
                            variant={'contained'}
                            onClick={() => {
                              window.location.href = item.websiteUrl as string;
                            }}
                          >
                            Website
                          </Button>
                          <Button
                            variant={'contained'}
                            onClick={() => {
                              window.location.href = item.explorerUrl as string;
                            }}
                          >
                            Explorer
                          </Button>
                        </Stack>

                        <Typography fontSize={16} fontWeight={'bold'} mt={2}>
                          Support Coins:
                        </Typography>
                        {item.coins.map((coin, index) => (
                          <Stack direction={'row'} alignItems={'center'} pt={2} key={index}>
                            <Image src={coin.icon} alt="coinImage" width={40} height={40} />
                            {coin.isMainCoin ? (
                              <Typography fontSize={14} fontWeight={'bold'} ml={1}>
                                {coin.name}
                              </Typography>
                            ) : (
                              <Link
                                href={GetBlockchainAddressUrlByChainIds(
                                  item.isMainnet,
                                  coin.chainId,
                                  coin.contractAddress as string,
                                )}
                                target="_blank"
                              >
                                <Typography fontSize={14} fontWeight={'bold'} ml={1}>
                                  {coin.name}
                                </Typography>
                              </Link>
                            )}
                          </Stack>
                        ))}
                        {item.rpc && item.rpc.length > 0 && (
                          <Box>
                            <Typography fontSize={16} fontWeight={'bold'} mt={4}>
                              RPC:
                            </Typography>
                            {item.rpc.map((item, index) => (
                              <Typography mt={1} key={index}>
                                {item}
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Stack>
                    {/* <Typography color={'green'} width={70}>
                      {item.time} ms
                    </Typography> */}
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          ))}
      </Container>
    </Box>
  );
};

export default BlockScan;
