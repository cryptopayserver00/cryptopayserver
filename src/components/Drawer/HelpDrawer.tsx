// import { Close, ExpandMore, HelpOutline } from '@mui/icons-material';
// import {
//   Accordion,
//   AccordionDetails,
//   AccordionSummary,
//   Box,
//   Divider,
//   Drawer,
//   IconButton,
//   Stack,
//   Typography,
// } from '@mui/material';
// import Link from 'next/link';

// type DrawerType = {
//   openDrawer: boolean;
//   setOpenDrawer: (value: boolean) => void;
// };

// export default function HelpDrawer(props: DrawerType) {
//   const toggleDrawer = (newOpen: boolean) => () => {
//     props.setOpenDrawer(newOpen);
//   };

//   return (
//     <Drawer open={props.openDrawer} onClose={toggleDrawer(false)} anchor={'right'}>
//       <Box role="presentation" width={400}>
//         <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} py={2} px={2}>
//           <Stack direction={'row'} alignItems={'center'}>
//             <HelpOutline />
//             <Typography variant={'h6'} ml={1}>
//               Help
//             </Typography>
//           </Stack>
//           <IconButton onClick={toggleDrawer(false)}>
//             <Close />
//           </IconButton>
//         </Stack>

//         <Divider />

//         <Box mt={4} px={2}>
//           <Accordion>
//             <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel1-content">
//               What is CryptoPayServer?
//             </AccordionSummary>
//             <AccordionDetails>
//               <Typography>
//                 CryptoPayServer is a leading coin payment processor. CryptoPayServer makes it possible for you to send
//                 and receive transactions very quickly using the crypto network.
//               </Typography>
//             </AccordionDetails>
//           </Accordion>
//           <Accordion>
//             <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel1-content">
//               What is CryptoPayServer wallet?
//             </AccordionSummary>
//             <AccordionDetails>
//               <Typography>
//                 A wallet is a software program that allows you to send and receive crypto from others in the network. It
//                 keeps track of your balance and transaction history. Each wallet has its own address, which functions
//                 similarly to your bank account&apos;s account number. There are lots of wallets available. Picking the
//                 right one is a matter of personal preference.
//               </Typography>
//             </AccordionDetails>
//           </Accordion>
//           <Accordion>
//             <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel1-content">
//               How to make the payment?
//             </AccordionSummary>
//             <AccordionDetails>
//               <Typography>There are many ways to pay:</Typography>
//               <Typography>QR Code</Typography>
//               <Typography>1. Open your onchain wallet and tap scan.</Typography>
//               <Typography>2. Scan the QR code.</Typography>
//               <Typography>3. Tap Pay, and you’re done!</Typography>
//             </AccordionDetails>
//           </Accordion>

//           <Box p={2} border={1} mt={4}>
//             <Typography>More Questions?</Typography>
//             <Typography mt={1}>
//               You can reach out to us <Link href={'#'}>here</Link> for more information
//             </Typography>
//           </Box>
//         </Box>
//       </Box>
//     </Drawer>
//   );
// }

import Link from 'next/link'
import { HelpCircle } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'

type DrawerType = {
  openDrawer: boolean
  setOpenDrawer: (value: boolean) => void
}

const FAQ_ITEMS = [
  {
    question: 'What is CryptoPayServer?',
    answer:
      'CryptoPayServer is a leading coin payment processor. CryptoPayServer makes it possible for you to send and receive transactions very quickly using the crypto network.',
  },
  {
    question: 'What is CryptoPayServer wallet?',
    answer:
      "A wallet is a software program that allows you to send and receive crypto from others in the network. It keeps track of your balance and transaction history. Each wallet has its own address, which functions similarly to your bank account's account number. There are lots of wallets available. Picking the right one is a matter of personal preference.",
  },
  {
    question: 'How to make the payment?',
    answer: (
      <div className="space-y-1.5">
        <p>There are many ways to pay:</p>
        <p className="font-medium pt-1">QR Code</p>
        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
          <li>Open your onchain wallet and tap scan.</li>
          <li>Scan the QR code.</li>
          <li>Tap Pay, and you&apos;re done!</li>
        </ol>
      </div>
    ),
  },
]

export default function HelpDrawer(props: DrawerType) {
  return (
    <Sheet open={props.openDrawer} onOpenChange={props.setOpenDrawer}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Help
          </SheetTitle>
        </SheetHeader>

        <Separator className="my-4" />

        <div className="space-y-6">
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-sm">{item.question}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* More questions */}
          <div className="rounded-lg border p-4 space-y-1.5">
            <p className="text-sm font-medium">More Questions?</p>
            <p className="text-sm text-muted-foreground">
              You can reach out to us{' '}
              <Link href="#" className="text-primary underline-offset-4 hover:underline">
                here
              </Link>{' '}
              for more information
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
