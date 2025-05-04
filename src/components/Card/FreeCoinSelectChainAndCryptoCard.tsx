import { ExpandMore } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import { BLOCKCHAIN, BLOCKCHAINNAMES, COIN } from 'packages/constants/blockchain';
import { useEffect, useState } from 'react';
import CreateFreeFundsDialog from 'components/Dialog/CreateFreeFundsDialog';

type SelectType = {
  network: number;
  amount: number;
  currency: string;
  onClickCoin: (item: COIN, address: string, amount: number) => Promise<void>;
};

export default function FreeCoinSelectChainAndCryptoCard(props: SelectType) {
  const [expanded, setExpanded] = useState<string | false>(false);
  const [blockchains, setBlockchains] = useState<BLOCKCHAIN[]>([]);
  const [selectCoinItem, setSelectCoinItem] = useState<COIN>();

  const [open, setOpen] = useState<boolean>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  useEffect(() => {
    const value = BLOCKCHAINNAMES.filter((item: any) => (props.network === 1 ? item.isMainnet : !item.isMainnet));
    setBlockchains(value);
  }, [props.network]);

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
        {blockchains &&
          blockchains.length > 0 &&
          blockchains.map((item, index) => (
            <Accordion expanded={expanded === item.name} onChange={handleChange(item.name)} key={index}>
              <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel1bh-content">
                <Typography sx={{ width: '33%', flexShrink: 0 }} fontWeight={'bold'}>
                  {item.name.toUpperCase()}
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>{item.desc}</Typography>
              </AccordionSummary>
              {item.coins &&
                item.coins.length > 0 &&
                item.coins.map((coinItem: COIN, coinIndex) => (
                  <AccordionDetails key={coinIndex}>
                    <Button
                      fullWidth
                      onClick={async () => {
                        setSelectCoinItem(coinItem);

                        setOpen(true);
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

      <CreateFreeFundsDialog
        network={props.network}
        selectCoinItem={selectCoinItem as COIN}
        openDialog={open}
        setOpenDialog={setOpen}
        onClickCoin={props.onClickCoin}
      />
    </Box>
  );
}
