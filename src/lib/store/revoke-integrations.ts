import type { Prisma, PrismaClient } from '@prisma/client'

type Tx = Prisma.TransactionClient | PrismaClient

/** Soft-revoke store credentials/integrations (archive or delete). */
export async function revokeStoreIntegrations(tx: Tx, storeId: number): Promise<void> {
  const where = { store_id: storeId, status: 1 }
  const data = { status: 2 }
  await tx.api_key_settings.updateMany({ where, data })
  await tx.user_roles.updateMany({ where, data })
  await tx.roles.updateMany({ where, data })
  await tx.webhook_settings.updateMany({ where, data })
  await tx.shopify_settings.updateMany({ where, data })
  await tx.email_settings.updateMany({ where, data })
  await tx.email_rule_settings.updateMany({ where, data })
  await tx.wallet_lightning_networks.updateMany({ where, data })
  await tx.wallet_lightning_network_settings.updateMany({ where, data })
  await tx.payment_settings.updateMany({ where, data })
  await tx.payout_settings.updateMany({ where, data })
  await tx.checkout_settings.updateMany({ where, data })
  await tx.notification_settings.updateMany({ where, data })
}

/** Soft-revoke all wallets/addresses/LN for a user (account deletion). */
export async function revokeUserSecrets(tx: Tx, userId: number): Promise<void> {
  const where = { user_id: userId, status: 1 }
  await tx.wallets.updateMany({
    where,
    data: { status: 2, mnemonic: '', password: '' },
  })
  await tx.addresses.updateMany({
    where,
    data: { status: 2, private_key: '' },
  })
  await tx.wallet_coin_enables.updateMany({ where, data: { status: 2 } })
  await tx.wallet_lightning_networks.updateMany({
    where,
    data: {
      status: 2,
      enabled: 2,
      server: '',
      access_token: '',
      refresh_token: '',
      macaroon: '',
      certthumbprint: '',
      rune: '',
    },
  })
  await tx.wallet_lightning_network_settings.updateMany({ where, data: { status: 2 } })
  await tx.api_key_settings.updateMany({ where, data: { status: 2 } })
}
