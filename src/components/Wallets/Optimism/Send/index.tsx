import {
  Box,
  Button,
  Container,
  FormControl,
  FormControlLabel,
  Icon,
  InputAdornment,
  OutlinedInput,
  Radio,
  RadioGroup,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore, useWalletPresistStore } from 'lib/store';
import { CHAINS, COINS } from 'packages/constants/blockchain';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { BigDiv } from 'utils/number';
import OptimismSVG from 'assets/chain/optimism.svg';
import Image from 'next/image';
import { OmitMiddleString } from 'utils/strings';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import Link from 'next/link';
import { COINGECKO_IDS, PAYOUT_STATUS } from 'packages/constants';
import { useRouter } from 'next/router';

type Coin = {
  [currency: string]: string;
};

const OptimismSend = () => {
  const router = useRouter();
  const { payoutId } = router.query;

  const [page, setPage] = useState<number>(1);
  const [fromAddress, setFromAddress] = useState<string>('');
  const [balance, setBalance] = useState<Coin>({});
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mb={10}>
      <Typography variant="h4" mt={4}>
        Send Coin on Optimism
      </Typography>
    </Box>
  );
};

export default OptimismSend;
