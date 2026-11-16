import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '@/pages/api'
import { WEB3 } from '@/packages/web3'
import { CHAINS } from '@/packages/constants/blockchain'
import { prisma } from '@/lib/prisma'
import {
  forbidden,
  getStoreAccess,
  requireAuth,
  STORE_PERMISSION,
  storeAccessHasPermission,
} from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.PUT) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const session = await requireAuth(req, res)
    if (!session) return

    const id = Number(req.body.id)
    if (!id) {
      return res.status(200).json({ message: 'Invalid id', result: false, data: null })
    }
    const owned = await prisma.address_books.findFirst({
      where: { id, status: 1 },
      select: {
        id: true,
        store_id: true,
        address: true,
        chain_id: true,
        network: true,
      },
    })
    if (!owned) {
      return forbidden(res)
    }

    const access = await getStoreAccess(owned.store_id, session.userId)
    if (!access || !storeAccessHasPermission(access, STORE_PERMISSION.ModifyStores)) {
      return forbidden(res, 'Insufficient store permission')
    }

    let updateData: { [key: string]: any } = {}

    if (req.body.name) updateData.name = String(req.body.name).slice(0, 200)
    if (req.body.address) updateData.address = String(req.body.address).trim()
    if (req.body.chain_id) updateData.chain_id = Number(req.body.chain_id)
    if (req.body.network) updateData.network = Number(req.body.network)

    const nextAddress = String(updateData.address ?? owned.address)
    const nextChainId = Number(updateData.chain_id ?? owned.chain_id)
    const nextNetwork = Number(updateData.network ?? owned.network)

    if (updateData.address || updateData.chain_id || updateData.network) {
      if (!nextChainId || !nextNetwork || !nextAddress) {
        return res.status(200).json({ message: 'Invalid address fields', result: false, data: null })
      }
      const addressOk = await WEB3.checkAddress(
        nextNetwork === 1,
        nextChainId as CHAINS,
        nextAddress
      )
      if (!addressOk) {
        return res.status(200).json({ message: 'Invalid chain address', result: false, data: null })
      }

      const find_address_books = await prisma.address_books.findMany({
        where: {
          chain_id: nextChainId,
          address: nextAddress,
          network: nextNetwork,
          store_id: owned.store_id,
          status: 1,
          NOT: { id: owned.id },
        },
      })

      if (find_address_books.length >= 1) {
        return res
          .status(200)
          .json({ message: 'Address already exists in address book', result: false, data: null })
      }
    }

    await prisma.address_books.update({
      data: updateData,
      where: {
        id: owned.id,
        user_id: access.ownerUserId,
        status: 1,
      },
    })

    return res.status(200).json({ message: '', result: true, data: null })
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      message: 'Internal server error',
      result: false,
      data: null,
    })
  }
}
