import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { REPORT_STATUS } from 'packages/constants';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        const startDate = req.query.start_date;
        const endDate = req.query.end_date;
        const status = req.query.status;
        const storeId = req.query.store_id;
        const network = req.query.network;

        let findData: { [key: string]: any } = {};

        if (req.query.start_date !== undefined) findData.start_date = req.body.start_date;
        if (req.query.start_date !== undefined) findData.start_date = req.body.start_date;
        if (req.query.start_date !== undefined) findData.start_date = req.body.start_date;
        if (req.query.start_date !== undefined) findData.start_date = req.body.start_date;
        if (req.query.start_date !== undefined) findData.start_date = req.body.start_date;

        const reports = await prisma.invoices.findMany({
          where: {
            source_type: String(status) && String(status) !== REPORT_STATUS.All ? String(status) : undefined,
            created_at: {
              gte: new Date(Number(startDate)),
              lte: new Date(Number(endDate)),
            },
            store_id: Number(storeId),
            network: Number(network),
            status: 1,
          },
          select: {
            order_id: true,
            chain_id: true,
            currency: true,
            amount: true,
            crypto: true,
            crypto_amount: true,
            rate: true,
            description: true,
            buyer_email: true,
            order_status: true,
            created_at: true,
            expiration_at: true,
            payment_method: true,
            source_type: true,
            paid: true,
            metadata: true,
            hash: true,
          },
          orderBy: {
            id: 'desc',
          },
        });

        if (!reports) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        const store = await prisma.stores.findFirst({
          where: {
            id: Number(storeId),
            status: 1,
          },
          select: {
            name: true,
          },
        });

        if (!store) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        const newReports = reports.map((item) => ({
          ...item,
          store_name: store.name,
        }));

        return res.status(200).json({
          message: '',
          result: true,
          data: newReports,
        });

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
