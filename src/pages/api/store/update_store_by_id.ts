import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import {
  forbidden,
  getStoreAccess,
  requireAuth,
  STORE_PERMISSION,
  storeAccessHasPermission,
} from '@/lib/auth'
import path from 'path'

/** Same-origin upload path only — no traversal, query, hash, or encoded dots. */
function normalizeUploadPublicPath(raw: string): string | null {
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
  // Store branding assets must be public images only (documents are private).
  if (!/^\/uploads\/image\/[A-Za-z0-9._-]+$/.test(normalized)) {
    return null
  }
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
    if (req.body.logo_url) {
      const logoUrl = normalizeUploadPublicPath(String(req.body.logo_url))
      if (logoUrl === null) {
        return res.status(200).json({
          message: 'logo_url must be a local /uploads/image path',
          result: false,
          data: null,
        })
      }
      updateData.logo_url = logoUrl
    }
    if (req.body.custom_css_url) {
      const cssUrl = normalizeUploadPublicPath(String(req.body.custom_css_url))
      if (cssUrl === null) {
        return res.status(200).json({
          message: 'custom_css_url must be a local /uploads/image path',
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
    if (req.body.add_additional_fee_to_invoice)
      updateData.add_additional_fee_to_invoice = Number(req.body.add_additional_fee_to_invoice)
    if (req.body.invoice_expires_if_not_paid_full_amount)
      updateData.invoice_expires_if_not_paid_full_amount = Number(
        req.body.invoice_expires_if_not_paid_full_amount
      )
    if (req.body.invoice_paid_less_than_precent)
      updateData.invoice_paid_less_than_precent = Number(req.body.invoice_paid_less_than_precent)
    if (req.body.minimum_expiraion_time_for_refund)
      updateData.minimum_expiraion_time_for_refund = Number(
        req.body.minimum_expiraion_time_for_refund
      )

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
