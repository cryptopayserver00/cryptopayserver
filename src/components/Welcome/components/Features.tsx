import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import MuiChip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { styled } from '@mui/material/styles';

import DevicesRoundedIcon from '@mui/icons-material/DevicesRounded';
import EdgesensorHighRoundedIcon from '@mui/icons-material/EdgesensorHighRounded';
import ViewQuiltRoundedIcon from '@mui/icons-material/ViewQuiltRounded';

const items = [
  {
    icon: <ViewQuiltRoundedIcon />,
    title: 'Free & Peer to Peer',
    description:
      'Direct, peer-to-peer payments. No merchant processing fees. No transaction fees (other than the network fee).',
    imageLight: `url("/images/dashboard.png")`,
    imageDark: `url("/images/dashboard.png")`,
  },
  {
    icon: <EdgesensorHighRoundedIcon />,
    title: 'Self-hosted',
    description:
      'Your node, your coins. No middleman. No KYC/AML. Non-custodial (complete control over the private key). Hardware wallet integration support.',
    imageLight: `url("/images/dashboard.png")`,
    imageDark: `url("/images/dashboard.png")`,
  },
  {
    icon: <DevicesRoundedIcon />,
    title: 'Cryptocurrency',
    description: 'Accept Crypto natively. Opt-in coin integrations.',
    imageLight: `url("/images/dashboard.png")`,
    imageDark: `url("/images/dashboard.png")`,
  },
  {
    icon: <DevicesRoundedIcon />,
    title: 'CMS integrations',
    description: 'WordPress & WooCommerce, Shopify, etc. and custom integrations.',
    imageLight: `url("/images/dashboard.png")`,
    imageDark: `url("/images/dashboard.png")`,
  },
  {
    icon: <DevicesRoundedIcon />,
    title: 'Apps',
    description:
      'Point-Of-Sale interface for physical stores. Crowdfunding interface for donation goals and fundraisers.',
    imageLight: `url("/images/dashboard.png")`,
    imageDark: `url("/images/dashboard.png")`,
  },
  {
    icon: <DevicesRoundedIcon />,
    title: 'Payment Buttons',
    description: 'Easy-embeddable HTML donation and pay buttons.',
    imageLight: `url("/images/dashboard.png")`,
    imageDark: `url("/images/dashboard.png")`,
  },
  {
    icon: <DevicesRoundedIcon />,
    title: 'Unlimited Stores',
    description: 'Merchants can process payments for their own stores, or for others.',
    imageLight: `url("/images/dashboard.png")`,
    imageDark: `url("/images/dashboard.png")`,
  },
  {
    icon: <DevicesRoundedIcon />,
    title: 'Transactions',
    description: 'Customers can pay in 20+ different languages.',
    imageLight: `url("/images/dashboard.png")`,
    imageDark: `url("/images/dashboard.png")`,
  },
  {
    icon: <DevicesRoundedIcon />,
    title: 'Payment Requests',
    description: 'Create & send a long-lived invoice requesting payment for goods or services.',
    imageLight: `url("/images/dashboard.png")`,
    imageDark: `url("/images/dashboard.png")`,
  },
];

interface ChipProps {
  selected?: boolean;
}

const Chip = styled(MuiChip)<ChipProps>(({ theme }) => ({
  variants: [
    {
      props: ({ selected }) => selected,
      style: {
        background: 'linear-gradient(to bottom right, hsl(210, 98%, 48%), hsl(210, 98%, 35%))',
        color: 'hsl(0, 0%, 100%)',
        // borderColor: (theme.vars || theme).palette.primary.light,
        '& .MuiChip-label': {
          color: 'hsl(0, 0%, 100%)',
        },
        ...theme.applyStyles('dark', {
          //   borderColor: (theme.vars || theme).palette.primary.dark,
        }),
      },
    },
  ],
}));

interface MobileLayoutProps {
  selectedItemIndex: number;
  handleItemClick: (index: number) => void;
  selectedFeature: (typeof items)[0];
}

export function MobileLayout({ selectedItemIndex, handleItemClick, selectedFeature }: MobileLayoutProps) {
  if (!items[selectedItemIndex]) {
    return null;
  }

  return (
    <Box
      sx={{
        display: { xs: 'flex', sm: 'none' },
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', gap: 2, overflow: 'auto' }}>
        {items.map(({ title }, index) => (
          <Chip
            size="medium"
            key={index}
            label={title}
            onClick={() => handleItemClick(index)}
            selected={selectedItemIndex === index}
          />
        ))}
      </Box>
      <Card variant="outlined">
        <Box
          sx={(theme) => ({
            mb: 2,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: 280,
            backgroundImage: 'var(--items-imageLight)',
            ...theme.applyStyles('dark', {
              backgroundImage: 'var(--items-imageDark)',
            }),
          })}
          style={
            items[selectedItemIndex]
              ? ({
                  '--items-imageLight': items[selectedItemIndex].imageLight,
                  '--items-imageDark': items[selectedItemIndex].imageDark,
                } as any)
              : {}
          }
        />
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography gutterBottom sx={{ color: 'text.primary', fontWeight: 'medium' }}>
            {selectedFeature.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
            {selectedFeature.description}
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}

export default function Features() {
  const [selectedItemIndex, setSelectedItemIndex] = React.useState(0);

  const handleItemClick = (index: number) => {
    setSelectedItemIndex(index);
  };

  const selectedFeature = items[selectedItemIndex];

  return (
    <Container id="features" sx={{ py: { xs: 8, sm: 16 } }}>
      <Box sx={{ width: { sm: '100%', md: '60%' } }}>
        <Typography component="h2" variant="h4" gutterBottom sx={{ color: 'text.primary' }}>
          Product features
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: { xs: 2, sm: 4 } }}>
          The product offers many useful features for merchants. After easily creating a wallet and setting up a store,
          they can use various features to facilitate both receiving and making payments.
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row-reverse' },
          gap: 2,
        }}
      >
        <div>
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              flexDirection: 'column',
              gap: 2,
              height: '100%',
            }}
          >
            {items.map(({ icon, title, description }, index) => (
              <Box
                key={index}
                component={Button}
                onClick={() => handleItemClick(index)}
                sx={[
                  (theme) => ({
                    p: 2,
                    height: '100%',
                    width: '100%',
                    '&:hover': {
                      //   backgroundColor: (theme.vars || theme).palette.action.hover,
                    },
                  }),
                  selectedItemIndex === index && {
                    backgroundColor: 'action.selected',
                  },
                ]}
              >
                <Box
                  sx={[
                    {
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'left',
                      gap: 1,
                      textAlign: 'left',
                      textTransform: 'none',
                      color: 'text.secondary',
                    },
                    selectedItemIndex === index && {
                      color: 'text.primary',
                    },
                  ]}
                >
                  {icon}

                  <Typography variant="h6">{title}</Typography>
                  <Typography variant="body2">{description}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
          <MobileLayout
            selectedItemIndex={selectedItemIndex}
            handleItemClick={handleItemClick}
            selectedFeature={selectedFeature}
          />
        </div>
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            width: { xs: '100%', md: '70%' },
            height: 'var(--items-image-height)',
          }}
        >
          <Card
            variant="outlined"
            sx={{
              height: '100%',
              width: '100%',
              display: { xs: 'none', sm: 'flex' },
              pointerEvents: 'none',
            }}
          >
            <Box
              sx={(theme) => ({
                m: 'auto',
                width: 420,
                height: 500,
                backgroundSize: 'contain',
                backgroundImage: 'var(--items-imageLight)',
                ...theme.applyStyles('dark', {
                  backgroundImage: 'var(--items-imageDark)',
                }),
              })}
              style={
                items[selectedItemIndex]
                  ? ({
                      '--items-imageLight': items[selectedItemIndex].imageLight,
                      '--items-imageDark': items[selectedItemIndex].imageDark,
                    } as any)
                  : {}
              }
            />
          </Card>
        </Box>
      </Box>
    </Container>
  );
}
