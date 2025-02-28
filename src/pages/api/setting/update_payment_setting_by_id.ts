import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';

export default async function handle(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const prisma = new PrismaClient();
        const id = req.body.id;

        let updateData: { [key: string]: any } = {};

        if (req.body.payment_expire !== undefined) updateData.payment_expire = Number(req.body.payment_expire);
        if (req.body.confirm_block !== undefined) updateData.confirm_block = Number(req.body.confirm_block);
        if (req.body.show_recommended_fee !== undefined)
          updateData.show_recommended_fee = Number(req.body.show_recommended_fee);
        if (req.body.current_used_address_id !== undefined)
          updateData.current_used_address_id = Number(req.body.current_used_address_id);

        const payment_setting = await prisma.payment_settings.update({
          data: updateData,
          where: {
            id: id,
            status: 1,
          },
        });

        if (!payment_setting) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({ message: '', result: true, data: null });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
