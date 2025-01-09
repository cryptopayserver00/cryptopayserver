import { Box, Button, Card, CardContent, Chip, Container, Icon, Skeleton, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSnackPresistStore } from 'lib/store/snack';
import { useWalletPresistStore } from 'lib/store';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
const PhraseBackup = () => {
  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);
  const { getIsWallet, getWalletId } = useWalletPresistStore((state) => state);
  const [isDisable, setIsDisable] = useState<boolean>(true);
  const [isView, setIsView] = useState<boolean>(false);

  const [phrase, setPhrase] = useState<string[]>([]);

  const onClickReConfirm = () => {
    window.location.href = '/wallet/phrase/backup/confirm';
  };

  const groupSize = 2;
  const groupedArray = Array.from({ length: Math.ceil(phrase.length / groupSize) }, (_, index) =>
    phrase.slice(index * groupSize, index * groupSize + groupSize),
  );

  const init = async () => {
    try {
      if (getIsWallet()) {
        const response: any = await axios.get(Http.find_wallet_by_id, {
          params: {
            id: getWalletId(),
          },
        });

        if (response.result && response.data.length === 1) {
          setPhrase(response.data[0].mnemonic.split(' '));
        } else {
          setSnackSeverity('error');
          setSnackMessage("Can't find the wallet, please try again later.");
          setSnackOpen(true);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <Box>
      <Container>
        <Stack mt={20}>
          <Typography variant="h4">Please record the following mnemonic phrase.</Typography>
          <Typography mt={5}>
            Connected devices may leak information. It is strongly recommended that you transcribe and securely store
            your mnemonic phrase as a backup.
          </Typography>

          <Box mt={5} width={500}>
            {!isView && (
              <div
                style={{
                  position: 'absolute',
                  width: 500,
                  height: 282,
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                  textAlign: 'center',
                  color: '#fff',
                }}
                onClick={() => {
                  setIsView(true);
                  setIsDisable(false);
                }}
              >
                <Box mt={10}>
                  <Icon component={VisibilityOffIcon} fontSize={'large'} />
                  <Typography mt={4}>Click to view mnemonic phrase</Typography>
                  <Typography mt={1}>Please make sure no one can view your screen</Typography>
                </Box>
              </div>
            )}
            <Card variant="outlined">
              <CardContent>
                {groupedArray.map((group, groupIndex) => (
                  <Box key={groupIndex} display="flex" mb={1}>
                    {group.map((item, itemIndex) => (
                      <Box key={itemIndex} mr={2}>
                        <Chip label={`${groupIndex * groupSize + itemIndex + 1}. ${item}`} style={{ width: 220 }} />
                      </Box>
                    ))}
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Box>

          <Box mt={16}>
            <Button variant={'contained'} size={'large'} onClick={onClickReConfirm} disabled={isDisable}>
              I have finished recording.
            </Button>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default PhraseBackup;
