import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { WEB3 } from 'packages/web3';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { GetSecureRandomString } from 'utils/strings';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'POST':
        const prisma = new PrismaClient();
        // const connection = await connectDatabase();
        const userId = req.body.user_id;
        const storeId = req.body.store_id;
        const import_wallet = req.body.import_wallet;
        const walletAccount = await WEB3.generateWallet(import_wallet);
        const name = GetSecureRandomString(12);

        const wallet = await prisma.wallets.create({
          data: {
            user_id: userId,
            store_id: storeId,
            name: name,
            mnemonic: walletAccount.mnemonic,
            is_backup: 2,
            is_generate: walletAccount.isGenerate ? 1 : 2,
            password: '',
            status: 1,
          },
        });

        if (!wallet) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        walletAccount.account &&
          walletAccount.account.length > 0 &&
          walletAccount.account.forEach(async (item) => {
            const address = await prisma.addresses.create({
              data: {
                user_id: userId,
                wallet_id: wallet.id,
                address: item.address,
                chain_id: item.chain,
                private_key: item.privateKey ? item.privateKey : '',
                note: item.note ? item.note : '',
                network: item.isMainnet ? 1 : 2,
                status: 1,
              },
            });

            if (!address) {
              return res.status(200).json({ message: '', result: false, data: null });
            }
          });

        return res.status(200).json({
          message: '',
          result: true,
          data: {
            wallet_id: wallet.id,
          },
        });

      // const createQuery =
      //   'INSERT INTO wallets (user_id, store_id, name, mnemonic, is_backup, is_generate, status) VALUES (?, ?, ?, ?, ?, ?, ?)';
      // const createValues = [userId, storeId, name, wallet.mnemonic, 2, wallet.isGenerate ? 1 : 2, 1];
      // const [ResultSetHeader]: any = await connection.query(createQuery, createValues);
      // const walletId = ResultSetHeader.insertId;
      // if (walletId === 0) {
      //   return res.status(200).json({ message: '', result: false, data: null });
      // }

      // wallet.account &&
      //   wallet.account.length > 0 &&
      //   wallet.account.forEach(async (item) => {
      //     const createWalletQuery =
      //       'INSERT INTO addresses (user_id, wallet_id, address, chain_id, private_key, note, network, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
      //     const createWalletValues = [
      //       userId,
      //       walletId,
      //       item.address,
      //       item.chain,
      //       item.privateKey,
      //       item.note,
      //       item.isMainnet ? 1 : 2,
      //       1,
      //     ];
      //     await connection.query(createWalletQuery, createWalletValues);
      //   });

      // return res.status(200).json({
      //   message: '',
      //   result: true,
      //   data: {
      //     wallet_id: walletId,
      //   },
      // });
      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'no support the api', result: false, data: e });
  }
}
