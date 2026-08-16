import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { DEFAULT_USER_ROLE_PERMISSIONS, USER_ROLE } from '@/packages/constants'
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

    const roles = await prisma.roles.findMany({
      where: {
        user_id: userId,
        store_id: storeId,
        status: 1,
      },
    })

    if (roles.length === 0) {
      // create default role
      const result = await prisma.roles.createMany({
        data: [
          {
            user_id: Number(userId),
            store_id: Number(storeId),
            role: USER_ROLE.Owner,
            permissions: DEFAULT_USER_ROLE_PERMISSIONS.Owner,
            status: 1,
          },
          {
            user_id: Number(userId),
            store_id: Number(storeId),
            role: USER_ROLE.Manager,
            permissions: DEFAULT_USER_ROLE_PERMISSIONS.Manager,
            status: 1,
          },
          {
            user_id: Number(userId),
            store_id: Number(storeId),
            role: USER_ROLE.Employee,
            permissions: DEFAULT_USER_ROLE_PERMISSIONS.Employee,
            status: 1,
          },
          {
            user_id: Number(userId),
            store_id: Number(storeId),
            role: USER_ROLE.Guest,
            permissions: DEFAULT_USER_ROLE_PERMISSIONS.Guest,
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
      data: roles.map((item) => ({
        id: item.id,
        userId: item.user_id,
        storeId: item.store_id,
        status: item.status,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        role: item.role,
        permissions: item.permissions,
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
