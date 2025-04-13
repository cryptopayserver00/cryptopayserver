import { Box, Button, Container, Divider, Grid, List, ListItem, Stack, Typography } from '@mui/material';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from 'lib/store';
import { useRouter } from 'next/router';
import { CURRENCY_SYMBOLS, ORDER_STATUS } from 'packages/constants';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { InvoiceEventDataTab } from '../../DataList/InvoiceEventDataTab';
import { FindChainNamesByChains, GetBlockchainAddressUrlByChainIds, GetBlockchainTxUrlByChainIds } from 'utils/web3';
import Link from 'next/link';

type OrderType = {
  orderId: number;
  sourceType: string;
  amount: number;
  buyerEmail: string;
  crypto: string;
  currency: string;
  description: string;
  destinationAddress: string;
  metadata: string;
  notificationEmail: string;
  notificationUrl: string;
  orderStatus: string;
  paid: number;
  paymentMethod: string;
  createdDate: number;
  expirationDate: number;
  rate: number;
  totalPrice: string;
  amountDue: string;
  fromAddress: string;
  toAddress: string;
  hash: string;
  blockTimestamp: number;
  network: number;
  chainId: number;
};

const PaymentInvoiceDetails = () => {
  const router = useRouter();
  const { id } = router.query;

  const { getStoreName } = useStorePresistStore((state) => state);
  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore((state) => state);

  const [order, setOrder] = useState<OrderType>({
    orderId: 0,
    sourceType: '',
    amount: 0,
    buyerEmail: '',
    crypto: '',
    currency: '',
    description: '',
    destinationAddress: '',
    metadata: '',
    notificationEmail: '',
    notificationUrl: '',
    orderStatus: '',
    paid: 0,
    paymentMethod: '',
    createdDate: 0,
    expirationDate: 0,
    rate: 0,
    totalPrice: '0',
    amountDue: '0',
    fromAddress: '',
    toAddress: '',
    hash: '',
    blockTimestamp: 0,
    network: 0,
    chainId: 0,
  });

  const init = async (id: any) => {
    try {
      const response: any = await axios.get(Http.find_invoice_by_id, {
        params: {
          id: id,
        },
      });

      if (response.result) {
        setOrder({
          orderId: response.data.order_id,
          sourceType: response.data.source_type,
          amount: response.data.amount,
          buyerEmail: response.data.buyer_email,
          crypto: response.data.crypto,
          currency: response.data.currency,
          description: response.data.description,
          destinationAddress: response.data.destination_address,
          metadata: response.data.metadata,
          notificationEmail: response.data.notification_email,
          notificationUrl: response.data.notification_url,
          orderStatus: response.data.order_status,
          paid: response.data.paid,
          paymentMethod: response.data.payment_method,
          createdDate: response.data.created_at,
          expirationDate: response.data.expiration_at,
          rate: response.data.rate,
          totalPrice: response.data.crypto_amount,
          amountDue: response.data.crypto_amount,
          fromAddress: response.data.from_address,
          toAddress: response.data.to_address,
          hash: response.data.hash,
          blockTimestamp: Number(response.data.block_timestamp),
          network: response.data.network,
          chainId: response.data.chain_id,
        });
      } else {
        setSnackSeverity('error');
        setSnackMessage('Can not find the invoice!');
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
    id && init(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onClickArchive = async () => {
    try {
      const response: any = await axios.put(Http.update_invoice_order_status_by_order_id, {
        order_id: order.orderId,
        order_status: ORDER_STATUS.Invalid,
      });

      if (response.result) {
        setSnackSeverity('success');
        setSnackMessage('Successful update!');
        setSnackOpen(true);

        window.location.reload();
      } else {
        setSnackSeverity('error');
        setSnackMessage('Something wrong, please try it again');
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
      <Container>
        <Stack direction={'row'} alignItems={'center'} mt={4}>
          <Typography variant={'h5'} fontWeight={'bold'}>
            Invoice
          </Typography>
          <Typography variant={'h5'} fontWeight={'bold'} ml={1}>
            {order.orderId}
          </Typography>
        </Stack>

        <Stack direction={'row'} alignItems={'center'} mt={4}>
          <Button
            variant={'outlined'}
            onClick={() => {
              window.location.href = '/invoices/' + order.orderId;
            }}
          >
            Checkout
          </Button>
          {order.orderStatus !== ORDER_STATUS.Invalid && (
            <Button variant={'outlined'} onClick={onClickArchive} style={{ marginLeft: 20 }}>
              Archive
            </Button>
          )}
        </Stack>

        <Box mt={4}>
          <Typography variant="h5" fontWeight={'bold'}>
            General Information
          </Typography>
          <List style={{ marginTop: 10 }}>
            <ListItem>
              <Grid container>
                <Grid item xs={3}>
                  <Typography>Store</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography>{getStoreName()}</Typography>
                </Grid>
              </Grid>
            </ListItem>
            <Divider />
            <ListItem>
              <Grid container>
                <Grid item xs={3}>
                  <Typography>Order Id</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography>{order.orderId}</Typography>
                </Grid>
              </Grid>
            </ListItem>
            <Divider />
            <ListItem>
              <Grid container>
                <Grid item xs={3}>
                  <Typography>Source Type</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography>{order.sourceType}</Typography>
                </Grid>
              </Grid>
            </ListItem>
            <Divider />
            <ListItem>
              <Grid container>
                <Grid item xs={3}>
                  <Typography>State</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography
                    color={
                      order.orderStatus === ORDER_STATUS.Expired
                        ? 'red'
                        : order.orderStatus === ORDER_STATUS.Settled
                        ? 'green'
                        : order.orderStatus === ORDER_STATUS.Processing
                        ? 'orange'
                        : order.orderStatus === ORDER_STATUS.Invalid
                        ? 'red'
                        : ''
                    }
                  >
                    {order.orderStatus}
                  </Typography>
                </Grid>
              </Grid>
            </ListItem>
            <Divider />
            <ListItem>
              <Grid container>
                <Grid item xs={3}>
                  <Typography>Created Date</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography>{new Date(order.createdDate).toLocaleString()}</Typography>
                </Grid>
              </Grid>
            </ListItem>
            <Divider />
            <ListItem>
              <Grid container>
                <Grid item xs={3}>
                  <Typography>Expiration Date</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography>{new Date(order.expirationDate).toLocaleString()}</Typography>
                </Grid>
              </Grid>
            </ListItem>
            <Divider />
            <ListItem>
              <Grid container>
                <Grid item xs={3}>
                  <Typography>Total Amount Due</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography>
                    {CURRENCY_SYMBOLS[order.currency]}
                    {order.amount}
                  </Typography>
                </Grid>
              </Grid>
            </ListItem>
            <Divider />
            <ListItem>
              <Grid container>
                <Grid item xs={3}>
                  <Typography>Refund Email</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography>{order.buyerEmail}</Typography>
                </Grid>
              </Grid>
            </ListItem>
          </List>
        </Box>

        <Box mt={4}>
          <Typography variant="h5" fontWeight={'bold'}>
            Product Information
          </Typography>

          <List style={{ marginTop: 10 }}>
            <ListItem>
              <Grid container>
                <Grid item xs={3}>
                  <Typography>Item Description</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography>{order.description}</Typography>
                </Grid>
              </Grid>
            </ListItem>
          </List>
        </Box>

        <Box mt={4}>
          <Typography variant="h5" fontWeight={'bold'}>
            Buyer Information
          </Typography>

          <List style={{ marginTop: 10 }}>
            <ListItem>
              <Grid container>
                <Grid item xs={3}>
                  <Typography>Email</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography>{order.buyerEmail}</Typography>
                </Grid>
              </Grid>
            </ListItem>
          </List>
        </Box>

        <Box mt={4}>
          <Typography variant="h5" fontWeight={'bold'}>
            Invoice Summary
          </Typography>

          <List style={{ marginTop: 10 }}>
            <ListItem>
              <Grid container>
                <Grid item xs={3}>
                  <Typography>Payment method</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography>{order.paymentMethod}</Typography>
                </Grid>
              </Grid>
            </ListItem>
            <Divider />
            <ListItem>
              <Grid container>
                <Grid item xs={3}>
                  <Typography>Destination</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography>{order.destinationAddress}</Typography>
                </Grid>
              </Grid>
            </ListItem>
            <Divider />
            <ListItem>
              <Grid container>
                <Grid item xs={3}>
                  <Typography>Chain</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography>{FindChainNamesByChains(order.chainId)?.toUpperCase()}</Typography>
                </Grid>
              </Grid>
            </ListItem>
            <Divider />
            <ListItem>
              <Grid container>
                <Grid item xs={3}>
                  <Typography>Rate</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography>
                    {CURRENCY_SYMBOLS[order.currency]}
                    {order.rate}
                  </Typography>
                </Grid>
              </Grid>
            </ListItem>
            <Divider />
            <ListItem>
              <Grid container>
                <Grid item xs={3}>
                  <Typography>Total due</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography>
                    {order.amountDue} {order.crypto}
                  </Typography>
                </Grid>
              </Grid>
            </ListItem>
            <Divider />
            <ListItem>
              <Grid container>
                <Grid item xs={3}>
                  <Typography>Paid</Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography>{order.paid === 1 ? 'True' : 'False'}</Typography>
                </Grid>
              </Grid>
            </ListItem>
            <Divider />
            {order.orderStatus === ORDER_STATUS.Settled && (
              <>
                <ListItem>
                  <Grid container>
                    <Grid item xs={3}>
                      <Typography>Hash</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <Link
                        target="_blank"
                        href={GetBlockchainTxUrlByChainIds(
                          order.network === 1 ? true : false,
                          order.chainId,
                          order.hash,
                        )}
                      >
                        {order.hash}
                      </Link>
                    </Grid>
                  </Grid>
                </ListItem>
                <Divider />
                <ListItem>
                  <Grid container>
                    <Grid item xs={3}>
                      <Typography>From Address</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <Link
                        target="_blank"
                        href={GetBlockchainAddressUrlByChainIds(
                          order.network === 1 ? true : false,
                          order.chainId,
                          order.fromAddress,
                        )}
                      >
                        {order.fromAddress}
                      </Link>
                    </Grid>
                  </Grid>
                </ListItem>
                <Divider />
                <ListItem>
                  <Grid container>
                    <Grid item xs={3}>
                      <Typography>To Address</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <Link
                        target="_blank"
                        href={GetBlockchainAddressUrlByChainIds(
                          order.network === 1 ? true : false,
                          order.chainId,
                          order.toAddress,
                        )}
                      >
                        {order.toAddress}
                      </Link>
                    </Grid>
                  </Grid>
                </ListItem>
                <Divider />
                <ListItem>
                  <Grid container>
                    <Grid item xs={3}>
                      <Typography>Block Timestamp</Typography>
                    </Grid>
                    <Grid item xs={9}>
                      <Typography>{new Date(order.blockTimestamp).toLocaleString()}</Typography>
                    </Grid>
                  </Grid>
                </ListItem>
                <Divider />
              </>
            )}
          </List>
        </Box>

        <Box mt={4}>
          <Typography variant="h5" fontWeight={'bold'}>
            Events
          </Typography>

          <Box mt={4}>
            <InvoiceEventDataTab orderId={order.orderId} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default PaymentInvoiceDetails;
