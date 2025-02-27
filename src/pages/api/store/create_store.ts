import type { NextApiRequest, NextApiResponse } from 'next';
import { CHAINS } from 'packages/constants/blockchain';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { NOTIFICATION, NOTIFICATIONS } from 'packages/constants';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'POST':
        const prisma = new PrismaClient();
        const userId = req.body.user_id;
        const name = req.body.name;
        const currency = req.body.currency;
        const priceSource = req.body.price_source;
        const brandColor = '#000000';
        const website = req.body.website;

        const store = await prisma.stores.create({
          data: {
            user_id: userId,
            name: name,
            currency: currency,
            price_source: priceSource,
            brand_color: brandColor,
            website: website,
            logo_url: '',
            custom_css_url: '',
            allow_anyone_create_invoice: 1,
            add_additional_fee_to_invoice: 1,
            invoice_expires_if_not_paid_full_amount: 1,
            invoice_paid_less_than_precent: 10,
            minimum_expiraion_time_for_refund: 10,
            status: 1,
          },
        });

        if (!store) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        // create notification setting
        let ids: number[] = [];
        NOTIFICATIONS.forEach(async (item: NOTIFICATION) => {
          ids.push(item.id);
        });
        const notification_setting = await prisma.notification_settings.create({
          data: {
            user_id: userId,
            store_id: store.id,
            notifications: ids.join(','),
            status: 1,
          },
        });

        if (!notification_setting) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        // create payment setting for blockchain
        const chainValues = Object.values(CHAINS);
        const filteredChainValues = chainValues.filter((value) => typeof value === 'number');
        filteredChainValues.forEach(async (item) => {
          const payment_setting = await prisma.payment_settings.createMany({
            data: [
              {
                user_id: userId,
                chain_id: item,
                network: 1,
                store_id: store.id,
                payment_expire: 30,
                confirm_block: 1,
                show_recommended_fee: 1,
                current_used_address_id: 0,
                status: 1,
              },
              {
                user_id: userId,
                chain_id: item,
                network: 2,
                store_id: store.id,
                payment_expire: 30,
                confirm_block: 1,
                show_recommended_fee: 1,
                current_used_address_id: 0,
                status: 1,
              },
            ],
          });

          if (!payment_setting) {
            return res.status(200).json({ message: '', result: false, data: null });
          }
        });

        return res.status(200).json({
          message: '',
          result: true,
          data: {
            id: store.id,
            name: store.name,
            currency: store.currency,
            price_source: store.price_source,
          },
        });

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
