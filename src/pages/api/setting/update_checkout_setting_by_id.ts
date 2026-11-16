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
import { assertSafeHttpUrl } from '@/lib/security/safe-url'

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
    const owned = await prisma.checkout_settings.findFirst({
      where: { id, status: 1 },
      select: { id: true, store_id: true },
    })
    if (!owned) {
      return forbidden(res)
    }

    const access = await getStoreAccess(owned.store_id, session.userId)
    if (!access || !storeAccessHasPermission(access, STORE_PERMISSION.ModifyStores)) {
      return forbidden(res, 'Insufficient store permission')
    }

    let updateData: { [key: string]: any } = {}

    if (req.body.show_payment_confetti)
      updateData.show_payment_confetti = Number(req.body.show_payment_confetti)
    if (req.body.show_sound) updateData.show_sound = Number(req.body.show_sound)
    if (req.body.show_pay_in_wallet_button)
      updateData.show_pay_in_wallet_button = Number(req.body.show_pay_in_wallet_button)
    if (req.body.show_detect_language)
      updateData.show_detect_language = Number(req.body.show_detect_language)
    if (req.body.language) updateData.language = req.body.language
    if (req.body.custom_html_title) updateData.custom_html_title = req.body.custom_html_title
    if (req.body.support_url !== undefined) {
      const supportUrl = String(req.body.support_url || '').trim()
      if (supportUrl) {
        const safe = await assertSafeHttpUrl(supportUrl)
        if (!safe.ok) {
          return res.status(200).json({ message: safe.message, result: false, data: null })
        }
        updateData.support_url = safe.url.toString()
      } else {
        updateData.support_url = ''
      }
    }
    if (req.body.show_payment_method)
      updateData.show_payment_method = Number(req.body.show_payment_method)
    if (req.body.show_redirect_url)
      updateData.show_redirect_url = Number(req.body.show_redirect_url)
    if (req.body.show_public_receipt_page)
      updateData.show_public_receipt_page = Number(req.body.show_public_receipt_page)
    if (req.body.show_payment_list)
      updateData.show_payment_list = Number(req.body.show_payment_list)
    if (req.body.show_qrcode_receipt)
      updateData.show_qrcode_receipt = Number(req.body.show_qrcode_receipt)
    if (req.body.show_header) updateData.show_header = Number(req.body.show_header)

    await prisma.checkout_settings.update({
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
