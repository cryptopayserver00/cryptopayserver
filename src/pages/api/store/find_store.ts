import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import { rateLimit, getStoreAccess, requireAuthUserId, storeAccessHasPermission, STORE_PERMISSION } from '@/lib/auth'

function mapStore(item: {
  id: number
  name: string
  website: string
  currency: string
  brand_color: string
  logo_url: string
  custom_css_url: string
  allow_anyone_create_invoice: number
  add_additional_fee_to_invoice: number
  invoice_expires_if_not_paid_full_amount: number
  invoice_paid_less_than_precent: number
  minimum_expiraion_time_for_refund: number
  price_source: string
}, meta?: { isOwner: boolean; role: string; permissionIds: number[] }) {
  return {
    id: item.id,
    name: item.name,
    website: item.website,
    currency: item.currency,
    brandColor: item.brand_color,
    logoUrl: item.logo_url,
    customCssUrl: item.custom_css_url,
    allowAnyoneCreateInvoice: item.allow_anyone_create_invoice,
    add_additionalFeeToInvoice: item.add_additional_fee_to_invoice,
    invoice_expiresIfNotPaidFullAmount: item.invoice_expires_if_not_paid_full_amount,
    invoicePaidLessThanPrecent: item.invoice_paid_less_than_precent,
    minimumExpiraionTimeForRefund: item.minimum_expiraion_time_for_refund,
    priceSource: item.price_source,
    isOwner: meta?.isOwner ?? true,
    role: meta?.role ?? 'Owner',
    permissions: meta?.permissionIds ?? [],
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const userId = await requireAuthUserId(req, res, req.query.user_id)
    if (!userId) return

    if (!(await rateLimit(req, res, { scope: 'rl-find_store', limit: 120, windowMs: 15 * 60 * 1000 }))) {
      return
    }

    const ownedStores = await prisma.stores.findMany({
      where: {
        user_id: userId,
        status: 1,
      },
    })

    const actor = await prisma.users.findFirst({
      where: { id: userId, status: 1 },
      select: { email: true },
    })

    const invitedStoreIds = new Set<number>()
    if (actor?.email) {
      const actorEmail = actor.email.trim().toLowerCase()
      const emailVariants = Array.from(new Set([actorEmail, actor.email.trim()]))
      const memberships = await prisma.user_roles.findMany({
        where: {
          email: { in: emailVariants },
          status: 1,
          NOT: { role: 'Owner' },
        },
        select: { store_id: true },
      })
      for (const m of memberships) invitedStoreIds.add(m.store_id)
    }

    // Drop ids already owned to avoid duplicates.
    for (const s of ownedStores) invitedStoreIds.delete(s.id)

    const invitedStores =
      invitedStoreIds.size > 0
        ? await prisma.stores.findMany({
            where: {
              id: { in: Array.from(invitedStoreIds) },
              status: 1,
            },
          })
        : []

    const ownedMapped = ownedStores.map((item) => mapStore(item))

    const invitedMapped = []
    for (const item of invitedStores) {
      const access = await getStoreAccess(item.id, userId)
      if (!access || !storeAccessHasPermission(access, STORE_PERMISSION.ViewStores)) continue
      invitedMapped.push(
        mapStore(item, {
          isOwner: false,
          role: access.role,
          permissionIds: Array.from(access.permissionIds),
        })
      )
    }

    return res.status(200).json({
      message: '',
      result: true,
      data: [...ownedMapped, ...invitedMapped],
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
