import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { USER_ROLE } from '@/packages/constants'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const storeId = Number(req.query.store_id)
    if (!storeId) {
      return res.status(200).json({ message: 'Invalid storeId', result: false, data: null })
    }

    const userId = Number(req.query.user_id)
    if (!userId) {
      return res.status(200).json({ message: 'Invalid userId', result: false, data: null })
    }

    const userRoles = await prisma.user_roles.findMany({
      where: {
        user_id: userId,
        store_id: storeId,
        status: 1,
      },
    })

    if (userRoles.length === 0) {
      // create default user role
      const user = await prisma.users.findFirst({
        where: {
          id: userId,
        },
      })

      if (!user) {
        return res.status(200).json({ message: 'Cannot find user', result: false, data: null })
      }

      const result = await prisma.user_roles.createMany({
        data: [
          {
            user_id: userId,
            store_id: storeId,
            email: user.email,
            role: USER_ROLE.Owner,
            status: 1,
          },
        ],
      })

      if (result.count === 0) {
        return res.status(200).json({ message: 'Cannot create many', result: false, data: null })
      }

      return res.status(200).json({ message: '', result: true, data: null })
    }

    return res.status(200).json({
      message: '',
      result: true,
      data: userRoles.map((item) => ({
        id: item.id,
        user_id: item.user_id,
        store_id: item.store_id,
        status: item.status,
        role: item.role,
        email: item.email,
        created_at: item.created_at,
        updated_at: item.updated_at,
      })),
    })
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      message: 'Internal server error',
      result: false,
      data: null,
    })
  }
}
