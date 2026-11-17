/**
 * One-shot migration: encrypt legacy plaintext secrets still stored in MySQL.
 *
 * Usage:
 *   node --env-file=.env scripts/reencrypt-secrets.mjs           # dry-run
 *   node --env-file=.env scripts/reencrypt-secrets.mjs --apply   # write updates
 *
 * Requires ENCRYPTION_KEY (>= 32 chars) and DATABASE_URL.
 */
import { createCipheriv, createHash, randomBytes } from 'crypto'
import { PrismaClient } from '@prisma/client'

const PREFIX = 'enc:v1:'
const HASH_PREFIX = 'hk:v1:'
const APPLY = process.argv.includes('--apply')

function getEncryptionKey() {
  const raw = process.env.ENCRYPTION_KEY
  if (!raw || raw.length < 32) {
    throw new Error('ENCRYPTION_KEY must be set to a random string of at least 32 characters')
  }
  return createHash('sha256').update(raw).digest()
}

function isEncrypted(value) {
  return Boolean(value && String(value).startsWith(PREFIX))
}

function encryptSecret(plaintext) {
  if (!plaintext) return plaintext
  if (isEncrypted(plaintext)) return plaintext
  const key = getEncryptionKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${PREFIX}${iv.toString('base64url')}:${tag.toString('base64url')}:${encrypted.toString('base64url')}`
}

function sealApiKey(apiKey) {
  if (!apiKey || String(apiKey).startsWith(HASH_PREFIX)) return apiKey
  const hex = createHash('sha256').update(String(apiKey)).digest('hex')
  const last4 = String(apiKey).slice(-4)
  return `${HASH_PREFIX}${hex}:${last4}`
}

/** @type {{ table: string, idField: string, fields: string[], whereExtra?: object }[]} */
const TARGETS = [
  { table: 'wallets', idField: 'id', fields: ['mnemonic'] },
  { table: 'addresses', idField: 'id', fields: ['private_key'] },
  { table: 'users', idField: 'id', fields: ['authenticator'] },
  { table: 'email_settings', idField: 'id', fields: ['password'] },
  { table: 'webhook_settings', idField: 'id', fields: ['secret'] },
  { table: 'shopify_settings', idField: 'id', fields: ['api_key', 'admin_api_access_token'] },
  {
    table: 'wallet_lightning_networks',
    idField: 'id',
    fields: ['access_token', 'refresh_token', 'macaroon', 'certthumbprint', 'rune'],
  },
]

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required')
  }
  // Touch key early so dry-run also validates config.
  getEncryptionKey()

  const prisma = new PrismaClient()
  let wouldUpdate = 0
  let updated = 0

  try {
    console.log(APPLY ? 'Mode: APPLY (writing)' : 'Mode: DRY-RUN (no writes)')

    for (const target of TARGETS) {
      const delegate = prisma[target.table]
      if (!delegate?.findMany) {
        console.warn(`skip missing model: ${target.table}`)
        continue
      }

      const rows = await delegate.findMany({
        select: Object.fromEntries([
          [target.idField, true],
          ...target.fields.map((f) => [f, true]),
        ]),
      })

      let tableHits = 0
      for (const row of rows) {
        const data = {}
        for (const field of target.fields) {
          const value = row[field]
          if (!value || isEncrypted(value)) continue
          data[field] = encryptSecret(value)
        }
        if (Object.keys(data).length === 0) continue

        tableHits += 1
        wouldUpdate += 1
        if (APPLY) {
          await delegate.update({
            where: { [target.idField]: row[target.idField] },
            data,
          })
          updated += 1
        }
      }
      console.log(`${target.table}: ${tableHits} row(s) with plaintext field(s)`)
    }

    // API keys are hashed (one-way), not AES-encrypted.
    {
      const rows = await prisma.api_key_settings.findMany({
        select: { id: true, api_key: true },
      })
      let tableHits = 0
      for (const row of rows) {
        if (!row.api_key || String(row.api_key).startsWith(HASH_PREFIX)) continue
        tableHits += 1
        wouldUpdate += 1
        if (APPLY) {
          await prisma.api_key_settings.update({
            where: { id: row.id },
            data: { api_key: sealApiKey(row.api_key) },
          })
          updated += 1
        }
      }
      console.log(`api_key_settings: ${tableHits} plaintext key(s)`)
    }

    console.log(
      APPLY
        ? `Done. Updated ${updated} row(s).`
        : `Dry-run complete. ${wouldUpdate} row(s) would be updated. Re-run with --apply to write.`
    )
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
