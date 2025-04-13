import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';
import { WEB3 } from 'packages/web3';
import { FindTokenByChainIdsAndSymbol } from 'utils/web3';
import { COINS } from 'packages/constants/blockchain';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        const id = req.query.id;

        //   const invoice: any = await prisma.$queryRaw`
        //   SELECT invoices.*, node_own_transactions.hash, node_own_transactions.address, node_own_transactions.from_address, node_own_transactions.to_address, node_own_transactions.transact_type, node_own_transactions.block_timestamp
        //   FROM invoices
        //   LEFT JOIN node_own_transactions
        //     ON invoices.match_tx_id = node_own_transactions.id
        //   WHERE invoices.order_id = ${id}
        //     AND invoices.status = 1;
        // `;

        //   if (!invoice || invoice.length !== 1) {
        //         return res.status(200).json({ message: '', result: false, data: null });

        //   }

        let invoice = await prisma.invoices.findFirst({
          where: {
            order_id: Number(id),
            status: 1,
          },
        });

        if (!invoice) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        const contractAddress = FindTokenByChainIdsAndSymbol(
          WEB3.getChainIds(invoice.network === 1 ? true : false, invoice.chain_id),
          invoice.crypto as COINS,
        ).contractAddress;

        const qrCodeText = WEB3.generateQRCodeText(
          invoice.network === 1 ? true : false,
          invoice.chain_id,
          invoice.destination_address,
          contractAddress,
          invoice.crypto_amount.toString(),
        );

        return res.status(200).json({
          message: '',
          result: true,
          data: {
            ...invoice,
            qr_code_text: qrCodeText,
          },
        });

      // return res.status(200).json({
      //   message: '',
      //   result: true,
      //   data: {
      //     order_id: invoice[0].order_id,
      //     amount: invoice[0].amount,
      //     buyer_email: invoice[0].buyer_email,
      //     crypto: invoice[0].crypto,
      //     currency: invoice[0].currency,
      //     description: invoice[0].description,
      //     destination_address: invoice[0].destination_address,
      //     metadata: invoice[0].metadata,
      //     notification_email: invoice[0].notification_email,
      //     notification_url: invoice[0].notification_url,
      //     order_status: invoice[0].order_status,
      //     paid: invoice[0].paid,
      //     payment_method: invoice[0].payment_method,
      //     created_at: invoice[0].created_at,
      //     expiration_at: invoice[0].expiration_at,
      //     rate: invoice[0].rate,
      //     chain_id: invoice[0].chain_id,
      //     crypto_amount: invoice[0].crypto_amount,
      //     from_address: invoice[0].from_address,
      //     to_address: invoice[0].to_address,
      //     hash: invoice[0].hash,
      //     block_timestamp: invoice[0].block_timestamp,
      //     network: invoice[0].network,
      //     source_type: invoice[0].source_type,
      //   },
      // });

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
