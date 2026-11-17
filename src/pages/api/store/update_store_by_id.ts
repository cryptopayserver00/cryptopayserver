import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import {
  rateLimit,
  forbidden,
  getStoreAccess,
  requireAuth,
  STORE_PERMISSION,
  storeAccessHasPermission,
} from '@/lib/auth'
import path from 'path'

/**
 * Same-origin upload path only — no traversal, query, hash, or encoded dots.
 * Images must live under /uploads/image/{userId}/ owned by the actor or store owner.
 */
function normalizeUploadPublicPath(raw: string, allowedUserIds: number[]): string | null {
  const trimmed = String(raw || '').trim()
  if (!trimmed) return ''
  if (trimmed.includes('\0') || trimmed.includes('?') || trimmed.includes('#') || trimmed.includes('\\')) {
    return null
  }
  let decoded = trimmed
  try {
    decoded = decodeURIComponent(trimmed)
  } catch {
    return null
  }
  if (decoded.includes('\0') || decoded.includes('..') || decoded.includes('\\')) {
    return null
  }
  if (!decoded.startsWith('/uploads/')) {
    return null
  }
  const normalized = path.posix.normalize(decoded)
  if (normalized !== decoded || !normalized.startsWith('/uploads/') || normalized.includes('..')) {
    return null
  }
  const match = normalized.match(/^\/uploads\/image\/(\d+)\/[A-Za-z0-9._-]+$/)
  if (!match) return null
  const ownerId = Number(match[1])
  if (!allowedUserIds.includes(ownerId)) return null
  return normalized
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.PUT) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const session = await requireAuth(req, res)
    if (!session) return

    if (!(await rateLimit(req, res, { scope: `update_store_by_id:${session.userId}`, limit: 60, windowMs: 15 * 60 * 1000 }))) {
      return
    }

    const id = Number(req.body.id)
    if (!id) {
      return res.status(200).json({ message: 'Invalid id', result: false, data: null })
    }
    const access = await getStoreAccess(id, session.userId)
    if (!access || !storeAccessHasPermission(access, STORE_PERMISSION.ModifyStores)) {
      return forbidden(res, 'Insufficient store permission')
    }

    let updateData: { [key: string]: any } = {}

    if (req.body.price_source) updateData.price_source = req.body.price_source
    if (req.body.brand_color) updateData.brand_color = req.body.brand_color
    const allowedUploadOwners = [...new Set([session.userId, access.ownerUserId])]

    if (req.body.logo_url) {
      const logoUrl = normalizeUploadPublicPath(String(req.body.logo_url), allowedUploadOwners)
      if (logoUrl === null) {
        return res.status(200).json({
          message: 'logo_url must be a local /uploads/image/{yourUserId}/… path you uploaded',
          result: false,
          data: null,
        })
      }
      updateData.logo_url = logoUrl
    }
    if (req.body.custom_css_url) {
      const cssUrl = normalizeUploadPublicPath(String(req.body.custom_css_url), allowedUploadOwners)
      if (cssUrl === null) {
        return res.status(200).json({
          message: 'custom_css_url must be a local /uploads/image/{yourUserId}/… path you uploaded',
          result: false,
          data: null,
        })
      }
      updateData.custom_css_url = cssUrl
    }
    if (req.body.currency) updateData.currency = req.body.currency
    // Public unauthenticated invoice creation is not implemented — always keep disabled.
    if (req.body.allow_anyone_create_invoice !== undefined) {
      updateData.allow_anyone_create_invoice = 2
    }
    if (
      req.body.add_additional_fee_to_invoice !== undefined &&
      req.body.add_additional_fee_to_invoice !== null &&
      req.body.add_additional_fee_to_invoice !== ''
    ) {
      updateData.add_additional_fee_to_invoice = Number(req.body.add_additional_fee_to_invoice)
    }
    if (
      req.body.invoice_expires_if_not_paid_full_amount !== undefined &&
      req.body.invoice_expires_if_not_paid_full_amount !== null &&
      req.body.invoice_expires_if_not_paid_full_amount !== ''
    ) {
      updateData.invoice_expires_if_not_paid_full_amount = Number(
        req.body.invoice_expires_if_not_paid_full_amount
      )
    }
    if (
      req.body.invoice_paid_less_than_precent !== undefined &&
      req.body.invoice_paid_less_than_precent !== null &&
      req.body.invoice_paid_less_than_precent !== ''
    ) {
      updateData.invoice_paid_less_than_precent = Number(req.body.invoice_paid_less_than_precent)
    }
    if (
      req.body.minimum_expiraion_time_for_refund !== undefined &&
      req.body.minimum_expiraion_time_for_refund !== null &&
      req.body.minimum_expiraion_time_for_refund !== ''
    ) {
      updateData.minimum_expiraion_time_for_refund = Number(
        req.body.minimum_expiraion_time_for_refund
      )
    }

    await prisma.stores.update({
      data: updateData,
      where: {
        id: access.storeId,
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
