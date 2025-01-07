import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { CRYPTOPRICE } from 'packages/web3/crypto_price';

export default async function handle(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const ids = req.query.ids;
        const currency = req.query.currency;

        const result = await CRYPTOPRICE.getCryptoPriceByCoinGecko(ids as string, currency as string);

        return res.status(200).json({ message: '', result: true, data: result });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
