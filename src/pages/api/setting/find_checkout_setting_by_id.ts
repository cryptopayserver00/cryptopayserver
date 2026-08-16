import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
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

    const checkout_setting = await prisma.checkout_settings.findFirst({
      where: {
        user_id: userId,
        store_id: storeId,
        status: 1,
      },
    })

    if (!checkout_setting) {
      const create_checkout_setting = await prisma.checkout_settings.create({
        data: {
          user_id: userId,
          store_id: storeId,
          show_payment_confetti: 2,
          show_sound: 2,
          show_pay_in_wallet_button: 1,
          show_detect_language: 1,
          language: 'English',
          custom_html_title: '',
          support_url: '',
          show_payment_method: 2,
          show_redirect_url: 2,
          show_public_receipt_page: 1,
          show_payment_list: 1,
          show_qrcode_receipt: 1,
          show_header: 1,
          status: 1,
        },
      })
      return res.status(200).json({
        message: '',
        result: true,
        data: {
          id: create_checkout_setting.id,
          storeId: create_checkout_setting.store_id,
          userId: create_checkout_setting.user_id,
          status: create_checkout_setting.status,
          createdAt: create_checkout_setting.created_at,
          updatedAt: create_checkout_setting.updated_at,
          showPaymentConfetti: create_checkout_setting.show_payment_confetti,
          showSound: create_checkout_setting.show_sound,
          showPayInWalletButton: create_checkout_setting.show_pay_in_wallet_button,
          showDetectLanguage: create_checkout_setting.show_detect_language,
          language: create_checkout_setting.language,
          customHtmlTitle: create_checkout_setting.custom_html_title,
          supportUrl: create_checkout_setting.support_url,
          showPaymentMethod: create_checkout_setting.show_payment_method,
          showRedirectUrl: create_checkout_setting.show_redirect_url,
          showPublicReceiptPage: create_checkout_setting.show_public_receipt_page,
          showPaymentList: create_checkout_setting.show_payment_list,
          showQrcodeReceipt: create_checkout_setting.show_qrcode_receipt,
          showHeader: create_checkout_setting.show_header,
        },
      })
    }

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        id: checkout_setting.id,
        storeId: checkout_setting.store_id,
        userId: checkout_setting.user_id,
        status: checkout_setting.status,
        createdAt: checkout_setting.created_at,
        updatedAt: checkout_setting.updated_at,
        showPaymentConfetti: checkout_setting.show_payment_confetti,
        showSound: checkout_setting.show_sound,
        showPayInWalletButton: checkout_setting.show_pay_in_wallet_button,
        showDetectLanguage: checkout_setting.show_detect_language,
        language: checkout_setting.language,
        customHtmlTitle: checkout_setting.custom_html_title,
        supportUrl: checkout_setting.support_url,
        showPaymentMethod: checkout_setting.show_payment_method,
        showRedirectUrl: checkout_setting.show_redirect_url,
        showPublicReceiptPage: checkout_setting.show_public_receipt_page,
        showPaymentList: checkout_setting.show_payment_list,
        showQrcodeReceipt: checkout_setting.show_qrcode_receipt,
        showHeader: checkout_setting.show_header,
      },
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
