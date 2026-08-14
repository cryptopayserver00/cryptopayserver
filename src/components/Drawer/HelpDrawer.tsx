import Link from 'next/link'
import { HelpCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
        <p className="pt-1 font-medium">QR Code</p>
        <ol className="list-inside list-decimal space-y-1 text-muted-foreground">
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
    <Dialog open={props.openDrawer} onOpenChange={props.setOpenDrawer}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Help
          </DialogTitle>
        </DialogHeader>

        <Separator className="my-2" />

        <div className="space-y-6">
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-sm">{item.question}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="space-y-1.5 rounded-lg border p-4">
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
      </DialogContent>
    </Dialog>
  )
}
