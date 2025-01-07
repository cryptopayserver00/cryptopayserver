import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { WEB3 } from 'packages/web3';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { BLOCKSCAN, BlockScanWalletType } from 'packages/web3/block_scan';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'POST':
        const connection = await connectDatabase();
        const userId = req.body.user_id;
        const walletId = req.body.wallet_id;
        const network = req.body.network;

        const query =
          'SELECT address, network, chain_id FROM addresses where user_id = ? and wallet_id = ? and network = ? and status = 1';
        const values = [userId, walletId, network];
        const [rows] = await connection.query(query, values);

        const blockscanWalletTypes: BlockScanWalletType[] = [];

        if (Array.isArray(rows) && rows.length > 0) {
          rows.map((item: any) => {
            blockscanWalletTypes.push({
              address: item.address,
              chain_id: WEB3.getChainIds(item.network === 1 ? true : false, item.chain_id),
            });
          });

          const result = await BLOCKSCAN.bulkStoreUserWallet(blockscanWalletTypes);
          return res.status(200).json({ message: '', result: result, data: null });
        }

        return res.status(200).json({ message: '', result: true, data: null });
      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'no support the api', result: false, data: e });
  }
}
