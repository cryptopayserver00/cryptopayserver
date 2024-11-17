import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { WEB3 } from 'packages/web3';
import { ResponseData, CorsMiddleware, CorsMethod } from '.';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'POST':
        const connection = await connectDatabase();
        const userId = req.body.user_id;
        const storeId = req.body.store_id;
        const import_wallet = req.body.import_wallet;
        const wallet = await WEB3.generateWallet(import_wallet);

        const createQuery =
          'INSERT INTO wallets (user_id, store_id, mnemonic, is_backup, is_generate, status) VALUES (?, ?, ?, ?, ?, ?)';
        const createValues = [userId, storeId, wallet.mnemonic, 1, wallet.isGenerate ? 1 : 2, 1];
        const [ResultSetHeader]: any = await connection.query(createQuery, createValues);
        const walletId = ResultSetHeader.insertId;
        if (walletId === 0) {
          return res.status(200).json({ message: 'Something wrong', result: false, data: null });
        }

        wallet.account &&
          wallet.account.length > 0 &&
          wallet.account.map(async (item) => {
            const createWalletQuery =
              'INSERT INTO addresses (user_id, wallet_id, address, chain_id, private_key, note, status) VALUES (?, ?, ?, ?, ?, ?, ?)';
            const createWalletValues = [userId, walletId, item.address, item.chain, item.privateKey, item.note, 1];
            await connection.query(createWalletQuery, createWalletValues);
          });

        return res.status(200).json({
          message: '',
          result: true,
          data: {
            wallet_id: walletId,
          },
        });
      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'no support the api', result: false, data: e });
  }
}
